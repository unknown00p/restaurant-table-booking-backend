import {
  restaurantInputType,
  searchInputTypes,
} from "../types/restaurants.type";

import { Booking } from "../model/booking.model";
import { Restaurant } from "../model/restaurant.model";
import { Table } from "../model/table.model";
import { ApiError } from "../utils/apiError";
import {
  addMinutesToTime,
  combineDateAndTime,
  convertStringToDate,
  convertTo24Hour,
  genrateNearbySlots,
  isValidTime,
} from "../utils/formateDateTime";
import { TableBooking } from "../model/tableBooking.model";
import { uploadToImageKit } from "../utils/imageUpload";
import { RestaurantRating } from "../model/restaurantRating";
import mongoose from "mongoose";
import { getRatingOfRestaurant } from "../controller/restaurant.controller";

export const searchWithAvailabilityService = async ({
  searchTerm,
  people,
  reservationDate,
  reservationTime,
}: searchInputTypes) => {
  if (!reservationDate || !reservationTime || !people || !searchTerm) {
    throw new ApiError(
      404,
      "please provide date, time, location and numberOfPeople fields"
    );
  }

  const convertedDate = convertStringToDate(reservationDate);
  let convertedTime = reservationTime;

  if (!isValidTime(reservationTime)) {
    const converted = convertTo24Hour(reservationTime);
    if (!converted) {
      throw new ApiError(400, "Invalid time format");
    }

    convertedTime = converted;
  }

  const searchTerms = searchTerm.toLowerCase().trim();
  const keywords = searchTerms.split(/\s+/);

  const query = {
    $or: keywords.map((keyword) => ({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { cuisines: { $regex: keyword, $options: "i" } },
        { "location.city": { $regex: keyword, $options: "i" } },
        { "location.area": { $regex: keyword, $options: "i" } },
      ],
    })),
  };

  const restaurant = await Restaurant.find(query);

  if (restaurant.length == 0) {
    throw new ApiError(
      404,
      "restaurants are not available at give time, date or location"
    );
  }

  const opendRestaurant = restaurant.filter(
    (data) => data.openTime < convertedTime && data.closeTime > convertedTime
  );

  // calculate reservationEnd for bookings
  const getBookingDuration = (guests: number) => {
    if (guests <= 2) return 60;
    if (guests <= 4) return 90;
    if (guests <= 8) return 120;
    return 150;
  };

  const timeSlots = genrateNearbySlots(convertedTime, convertedDate);

  const restaurants = await Promise.all(
    opendRestaurant.map(async (data) => {
      // find booking that is matched between reservation start and end
      const availableSlots = [];
      for (const timeSlot of timeSlots) {
        const timeToStay = getBookingDuration(Number(people));
        const reservationEnd = addMinutesToTime(timeSlot, timeToStay);

        const reservationStartDateTime = combineDateAndTime(
          String(convertedDate),
          timeSlot
        );

        const restaurantClosingDateTime = combineDateAndTime(
          String(convertedDate),
          data.closeTime
        );

        const reservationEndDateTime = combineDateAndTime(
          String(convertedDate),
          reservationEnd
        );

        if (reservationEndDateTime > restaurantClosingDateTime) continue;

        const matchedTablesIds = await Booking.aggregate([
          {
            $match: {
              restaurantId: data._id,
              reservationStartDateTime: { $lt: reservationEndDateTime },
              reservationEndDateTime: { $gt: reservationStartDateTime },
            },
          },
          {
            $lookup: {
              from: "tablebookings",
              localField: "_id",
              foreignField: "bookingId",
              as: "matchedBookingTables",
            },
          },
          {
            $project: {
              tableIds: {
                $map: {
                  input: "$matchedBookingTables",
                  as: "table",
                  in: "$$table.tableId",
                },
              },
            },
          },
        ]);

        const tableIds = matchedTablesIds.flat().map((data) => {
          return data.tableIds.toString();
        });

        const tables = await Table.find({ restaurantId: data._id });

        const filterdTables = tables.filter(
          ({ _id }) => !tableIds.includes(_id.toString())
        );

        let shortedTables = filterdTables.filter(
          (data) => data.capacity >= people
        );

        let smallest = Number.MAX_VALUE;
        let matchedTables = [];

        if (shortedTables.length !== 0) {
          for (let i = 0; i < shortedTables.length; i++) {
            if (smallest === shortedTables[i].capacity) {
              smallest = shortedTables[i].capacity;
              matchedTables.push(shortedTables[i]);
            } else if (smallest > shortedTables[i].capacity) {
              matchedTables = [];
              smallest = shortedTables[i].capacity;
              matchedTables.push(shortedTables[i]);
            }
          }
        } else {
          if (shortedTables.length == 0) {
            shortedTables = filterdTables.filter(
              (data) => data.capacity < people
            );
          }
        }
        console.log(matchedTables.length)
        console.log(timeSlot)
        console.log(matchedTables)

        if (matchedTables.length > 0) {
          availableSlots.push({
            time: timeSlot,
            tables: matchedTables,
          });
        }
      }

      const resRating = await RestaurantRating.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(data._id) } },
        {
          $group: {
            _id: "$_id",
            averageRating: { $avg: "$ratingNumber" },
            totalRatings: { $sum: 1 },
          },
        },
      ]);

      return {
        id: data._id,
        name: data.name,
        mainImage: data.mainImage,
        availableSlots: availableSlots.map((slots) => ({
          time: slots.time,
          availableTableId: slots.tables.map((table) => table._id),
        })),
        cuisines: data.cuisines,
        location: data.location,
        openTime: data.openTime,
        closeTime: data.closeTime,
        resRating: resRating.map((rating) => ({
          totalRatings: rating.totalRatings,
          averageRating: rating.averageRating,
        })),
      };
    })
  );

  return restaurants;
};

export const addRestaurantService = async ({
  name,
  city,
  area,
  cuisines,
  numberOfTables,
  openTime,
  closeTime,
  mainImage,
  subImages,
  minimumDeposite,
  price,
  policies
}: restaurantInputType) => {

  if (
    (typeof name !== "string" ||
      typeof city !== "string" ||
      typeof area !== "string" ||
      !Array.isArray(cuisines) ||
      typeof numberOfTables !== "number" ||
      typeof openTime !== "string" ||
      typeof closeTime !== "string" ||
      typeof minimumDeposite !== "number" ||
      typeof price !== "number" ||
      !Array.isArray(policies)
  )
  ) {
    throw new ApiError(404, "all feilds are required");
  }

  const mainImageRes = await uploadToImageKit(mainImage);

  const subImagesUrl = [];
  const subImagesRes = await uploadToImageKit(subImages);
  subImagesRes.map((img) => {
    subImagesUrl.push(img.url);
  });

  const restaurant = await Restaurant.findOne({ name });

  if (restaurant && restaurant.location.area == area) {
    throw new ApiError(
      400,
      "restaurant with same name and location already exists"
    );
  }

  // commented for now because middlerware not applied
  // const user = req.user;
  // if (user.role !== "admin") {
  //   throw new ApiError(
  //     401,
  //     "user does not have permission to add restaurant"
  //   );
  // }

  let formattedOpenTime = openTime;
  let formattedCloseTime = closeTime;

  if (!isValidTime(openTime)) {
    const converted = convertTo24Hour(openTime);
    if (!converted) {
      throw new ApiError(400, "Invalid openTime format");
    }
    formattedOpenTime = converted;
  }

  if (!isValidTime(closeTime)) {
    const converted = convertTo24Hour(closeTime);
    if (!converted) {
      throw new ApiError(400, "Invalid closeTime format");
    }
    formattedCloseTime = converted;
  }

  const addedRestaurant = await Restaurant.create({
    name: name.trim().toLowerCase(),
    location: {
      city: city.trim().toLowerCase(),
      area: area.trim().toLowerCase(),
    },
    cuisines: cuisines.map((cuisine) => cuisine.trim().toLowerCase()),
    numberOfTables,
    openTime: formattedOpenTime,
    closeTime: formattedCloseTime,
    mainImage: mainImageRes[0].url,
    subImages: subImagesUrl,
    policies,
    perPersonPrice:{
      price: Number(price),
      minimumDeposite: Number(minimumDeposite)
    }
  });

  if (!addedRestaurant) {
    throw new ApiError(500, "got error while adding restaurant");
  }

  return addedRestaurant;
};

export const getRestaurantByIdService = async (restaurantId: string) => {
  if (!restaurantId) {
    throw new ApiError(400, "Please provide restaurant ID");
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  return restaurant;
};

export const updateRestaurantNameService = async ({
  newName,
  restaurantId,
}: {
  newName: string;
  restaurantId: string;
}) => {
  // commented for now because middlerware not applied
  // const user = req.user;
  // if (user.role !== "admin") {
  //   throw new ApiError(
  //     401,
  //     "user does not have permission to add restaurant"
  //   );
  // }

  if (!newName || !restaurantId) {
    throw new ApiError(404, "all feilds are required");
  }

  const updateName = await Restaurant.findByIdAndUpdate(
    { _id: restaurantId },
    { name: newName },
    { new: true }
  );

  if (!updateName) {
    throw new ApiError(500, "got error while updating the name");
  }

  return updateName;
};

export const updateCuisineService = async ({
  cuisines,
  restaurantId,
}: {
  cuisines: [string];
  restaurantId: string;
}) => {
  // commented for now because middlerware not applied
  // const user = req.user;
  // if (user.role !== "admin") {
  //   throw new ApiError(
  //     401,
  //     "user does not have permission to add restaurant"
  //   );
  // }

  if (!cuisines || !restaurantId) {
    throw new ApiError(404, "all feilds are required");
  }

  const updatedCuisine = await Restaurant.findByIdAndUpdate(
    { _id: restaurantId },
    { cuisines },
    { new: true }
  );

  if (!updatedCuisine) {
    throw new ApiError(500, "got error while updating the cuisine");
  }

  return updatedCuisine;
};

export const removeRestaurantService = async ({
  restaurantId,
}: {
  restaurantId: string;
}) => {
  // commented for now because middlerware not applied
  // const user = req.user;
  // if (user.role !== "admin") {
  //   throw new ApiError(
  //     401,
  //     "user does not have permission to add restaurant"
  //   );
  // }

  if (!restaurantId) {
    throw new ApiError(404, "please provide restaurantId");
  }

  const deleteRestaurant = await Restaurant.findOneAndDelete({
    _id: restaurantId,
  });

  if (!deleteRestaurant) {
    throw new ApiError(500, "got error while deleting restaurant");
  }

  // delete all the table and booking related to that restaurant
  const tableIds = await Table.find({ restaurantId }).distinct("_id");

  const deleteTableBookings = await TableBooking.deleteMany({ restaurantId });
  if (!deleteTableBookings) {
    throw new ApiError(
      500,
      "Failed to delete table bookings for the restaurant."
    );
  }

  const deleteBooking = await Booking.deleteMany({ restaurantId });
  if (!deleteBooking) {
    throw new ApiError(500, "Failed to delete bookings for the restaurant.");
  }

  const deleteTables = await Table.deleteMany({ _id: tableIds });
  if (!deleteTables) {
    throw new ApiError(500, "Failed to delete tables for the restaurant.");
  }

  return deleteRestaurant;
};

export const rateRestaurantService = async ({
  restaurantId,
  userId,
  ratingNumber,
  ratingText,
}: {
  restaurantId: string;
  userId: string;
  ratingNumber: number;
  ratingText: string;
}) => {
  if (!restaurantId || !userId || !ratingNumber || !ratingText) {
    throw new ApiError(400, "please provide all fields");
  }

  // check if user is allowed to rate
  const bookingData = await Booking.find({
    restaurantId,
    userId,
    reservationStatus: "confirmed",
  });

  const validBookings = bookingData.filter((b) => {
    return b.reservationEndDateTime < new Date();
  });

  if (validBookings.length == 0) {
    throw new ApiError(402, "you are not allowed to rate");
  }

  // if userId and restaurantId is same update the existing rating
  const updatedOrCreatedRating = await RestaurantRating.findOneAndUpdate(
    { restaurantId, userId },
    { ratingNumber, ratingText },
    { new: true, upsert: true }
  );

  if (!updatedOrCreatedRating) {
    throw new ApiError(405, "Error while adding/updating rating");
  }

  return updatedOrCreatedRating;
};

export const getRatingOfRestaurantService = async ({
  restaurantId,
}: {
  restaurantId: string;
}) => {
  if (!restaurantId) {
    throw new ApiError(401, "restaurantId is required");
  }

  const data = await RestaurantRating.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    {
      $group: {
        _id: "$_id",
        averageRating: { $avg: "$ratingNumber" },
        totalRatings: { $sum: 1 },
        reviews: {
          $push: {
            userId: "$userId",
            ratingNumber: "$ratingNumber",
            ratingText: "$ratingText",
            createdAt: "$createdAt",
          },
        },
      },
    },
  ]);

  return data;
};

export const allowRatingService = async ({
  restaurantId,
  userId,
}: {
  restaurantId: string;
  userId: string;
}) => {
  if (!restaurantId || !userId) {
    throw new ApiError(401, "restaurantId and userId is required");
  }

  const bookingData = await Booking.find({
    restaurantId,
    userId,
    reservationStatus: "confirmed",
  });

  const validBookings = bookingData.filter((b) => {
    return b.reservationEndDateTime < new Date();
  });

  if (validBookings.length == 0) {
    return false;
  }

  return true;
};
