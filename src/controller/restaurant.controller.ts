import { Response, Request, RequestHandler } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { Restaurant } from "../model/restaurant.model";
import { ApiResponse } from "../utils/apiResponse";
import { authorizedUser } from "../types/user.type";
import { Table } from "../model/table.model";
import { TableBooking } from "../model/tableBooking.model";
import { Booking } from "../model/booking.model";
import {
  isValidTime,
  convertTo24Hour,
  convertStringToDate,
  addMinutesToTime,
} from "../utils/formateDateTime";

export const addRestaurant = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { name, location, cuisines, numberOfTables, openTime, closeTime } =
      req.body;

    const restaurant = await Restaurant.findOne({ name });

    if (restaurant && restaurant.location.area == location.area) {
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

    if (
      !name ||
      !location ||
      !cuisines ||
      !numberOfTables ||
      !openTime ||
      !closeTime
    ) {
      throw new ApiError(404, "all feilds are required");
    }

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
      name,
      location,
      cuisines,
      numberOfTables,
      openTime: formattedOpenTime,
      closeTime: formattedCloseTime,
    });

    if (!addedRestaurant) {
      throw new ApiError(500, "got error while adding restaurant");
    }

    // for (let i = 0; i < addedRestaurant.numberOfTables; i++) {
    //   await Table.create({
    //     tableNumber: `T${i + 1}`,
    //     restaurantId: addedRestaurant._id,
    //     capacity: tableCapacity,
    //   });
    // }

    res
      .status(200)
      .json(
        new ApiResponse(200, "added restaurant successfully", addedRestaurant)
      );
  }
);

export const getRestaurantById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    throw new ApiError(404, "please provide restaurant id");
  }

  const restaurant = await Restaurant.findOne({ _id: restaurantId });

  if (!restaurant) {
    throw new ApiError(500, "restaurant not found");
  }

  res
    .status(200)
    .send(new ApiResponse(200, "retrived restaurant successfully", restaurant));
});

export const updateName = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { newName, restaurantId } = req.body;

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

    res
      .status(200)
      .json(new ApiResponse(200, "name update successfully", updateName));
  }
);

export const updateCuisine = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { cuisines, restaurantId } = req.body;

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

    res
      .status(200)
      .json(
        new ApiResponse(200, "cuisine update successfully", updatedCuisine)
      );
  }
);

// export const updateNumberOfTables = asyncHandler(
//   async (req: authorizedUser, res: Response) => {
//     const { numberOfTables, restaurantId } = req.body;

//     // commented for now because middlerware not applied
//     // const user = req.user;
//     // if (user.role !== "admin") {
//     //   throw new ApiError(
//     //     401,
//     //     "user does not have permission to add restaurant"
//     //   );
//     // }

//     if (!numberOfTables || !restaurantId) {
//       throw new ApiError(404, "all feilds are required");
//     }

//     const previousTableNo = await Restaurant.findById({_id: restaurantId})

//     if (previousTableNo < numberOfTables) {

//     }

//     const updateNumberOfTables = await Restaurant.findByIdAndUpdate(
//       { _id: restaurantId },
//       { numberOfTables },
//       { new: true }
//     );

//     if (!updateNumberOfTables) {
//       throw new ApiError(500, "got error while updating the cuisine");
//     }

//     res
//       .status(200)
//       .json(
//         new ApiResponse(200, "tables update successfully", updateNumberOfTables)
//       );
//   }
// );

export const removeRestaurant = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { restaurantId } = req.params;
    console.log("params", restaurantId);

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

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "deleted restaurant and related tables and bookings successfully"
        )
      );
  }
);

type SearchQuery = {
  restaurantName?: string;
  location?: string;
  cuisine?: string;
  numberOfPeople?: number;
  date?: string;
  time?: string;
};

export const SearchRestaurantWithAvailiblity: RequestHandler = asyncHandler(
  async (req, res) => {
    const {
      restaurantName,
      location,
      cuisine,
      people,
      reservationDate,
      reservationTime,
    } = req.body;

    if (!reservationDate || !reservationTime || !people || !location) {
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

    const query: any = {};

    const { city, area } = location;

    if (city) {
      query["location.city"] = city;
    }

    if (area) {
      query["location.area"] = area;
    }

    console.log(query);

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

    const timeToStay = getBookingDuration(Number(people));
    const reservationEnd = addMinutesToTime(convertedTime, timeToStay);

    console.log('opendRestaurant',opendRestaurant)

    const restaurants = await Promise.all(
      opendRestaurant.map(async (data) => {

        // find booking that is matched between reservation start and end
        const booking = await Booking.find({
          restaurantId: data._id,
          reservationDate: convertedDate,
          reservationTimeStart: { $lt: reservationEnd },
          reservationEnd: { $gt: convertedTime },
        });

        let tableIdsMatchedTables = await Promise.all(
          booking.map(async (data) => {
            const ids = await TableBooking.find({
              bookingId: data.id,
            }).distinct("tableId");
            return ids;
          })
        );

        const tableIds = tableIdsMatchedTables.flat().map((id) => {
          return id.toString();
        });

        // console.log('tableIds',tableIds)

        const tables = await Table.find({ restaurantId: data._id });

        const filterdTables = tables.filter(
          ({ _id }) => !tableIds.includes(_id.toString())
        );

        // console.log('filterdTables',filterdTables)

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

        if (matchedTables.length == 0) {
          console.log("shortedTables", shortedTables);
          // Todo --> mearge multiple tables and to fulfill the requirement of the larger party and even after merging the tables if requerment not meets send a message that the
        }
        // console.log("matchedTables", matchedTables);
        return matchedTables;
      })
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, "Restaurants fetched successfully", restaurants)
      );
  }
);
