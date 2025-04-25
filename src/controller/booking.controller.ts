import { Request, Response } from "express";
import { Booking } from "../model/booking.model";
import { BookingCancelation } from "../model/bookingCancelation.model";
import { Restaurant } from "../model/restaurant.model";
import { Table } from "../model/table.model";
import { TableBooking } from "../model/tableBooking.model";
import { authorizedUser } from "../types/user.type";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addMinutesToTime,
  combineDateAndTime,
  convertStringToDate,
  convertTo24Hour,
  createDateWithTime,
  isValidTime,
} from "../utils/formateDateTime";

export const bookTable = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    // tableId,
    people,
    reservationDate,
    reservationTime,
    userId,
  } = req.body;

  if (
    !restaurantId ||
    !people ||
    !reservationDate ||
    !reservationTime
    // !tableId
  ) {
    throw new ApiError(404, "all fields are required");
  }

  let formattedReservationTime = reservationTime;

  if (!isValidTime(reservationTime)) {
    const converted = convertTo24Hour(reservationTime);
    if (!converted) {
      throw new ApiError(400, "Invalid time format");
    }

    formattedReservationTime = converted;
  }

  const convertedDate = convertStringToDate(reservationDate);

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "restaurant with this id does not exists");
  }

  const getBookingDuration = (guests: string) => {
    if (guests <= "2") return 60;
    if (guests <= "4") return 90;
    if (guests <= "8") return 120;
    return 150;
  };

  const timeToStay = getBookingDuration(people);
  const reservationEnd = addMinutesToTime(formattedReservationTime, timeToStay);

  const basedDate = combineDateAndTime(
    String(convertedDate),
    formattedReservationTime
  );

  const closingDateWithTime = combineDateAndTime(
    String(convertedDate),
    restaurant.closeTime
  );
  const reservationEndTime = createDateWithTime(basedDate, reservationEnd);

  if (reservationEndTime > closingDateWithTime) {
    throw new ApiError(
      404,
      "table for that time in this restaurant is available"
    );
  }

  // console.table([restaurantId,convertedDate,reservationEnd,formattedReservationTime])
  // console.log(convertedDate)

  const matchedTablesIds = await Booking.aggregate([
    {
      $match: {
        restaurantId,
        reservationDate: convertedDate,
        reservationTimeStart: { $lt: reservationEnd },
        reservationEnd: { $gt: formattedReservationTime },
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

  // console.log("matchedTablesIds", matchedTablesIds);

  const tableIds = matchedTablesIds.flat().map((id) => {
    return id.toString();
  });

  const tables = await Table.find({ restaurantId });

  const filterdTables = tables.filter(
    ({ _id }) => !tableIds.includes(_id.toString())
  );

  let shortedTables = filterdTables.filter((data) => data.capacity >= people);
  // console.log("shortedTables", shortedTables);

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
      shortedTables = filterdTables.filter((data) => data.capacity < people);
    }
  }

  // if (matchedTables.length == 0) {
  //   console.log("shortedTables", shortedTables);
  //   // Todo --> mearge multiple tables and to fulfill the requirement of the larger party and even after merging the tables if requerment not meets send a message that the
  // }
  // console.log("matchedTables", matchedTables);

  // const newBooking = await Booking.create({
  //   restaurantId,
  //   reservationDate: convertedDate,
  //   reservationTimeStart: formattedReservationTime,
  //   reservationEnd,
  //   userId,
  //   reservationStatus: "confirmed",
  // });

  // const tableBooking = await TableBooking.create({
  //   tableId: matchedTables[0]?._id,
  //   bookingId: newBooking._id,
  //   restaurantId,
  // });

  // res.status(201).json(
  //   new ApiResponse(201, "Table booked successfully", {
  //     booking: newBooking,
  //     tableBooking,
  //   })
  // );

  res.status(201).json(
    new ApiResponse(201, "Table booked successfully", {
      data: matchedTables,
    })
  );
});

// export const getAvailableTableTime = asyncHandler(async (req, res) => {
//   const { restaurantId, reservationDateTime, reservationEnd } = req.body;

//   if (!restaurantId || !reservationDateTime || !reservationEnd) {
//     throw new ApiError(404, "all fields are required");
//   }

//   // getAllTables
//   const allTables = await Table.find({ restaurantId: restaurantId });

//   const overlappingBookingIds = await Booking.find({
//     restaurantId,
//     reservationDateTime: { $lt: reservationEnd },
//     reservationEnd: { $gt: reservationDateTime },
//     reservationStatus: "confirmed",
//   }).distinct("_id");

//   // console.log("overlappingBookingIds", overlappingBookingIds);

//   const bookedTableIds = await TableBooking.find({
//     bookingId: { $in: overlappingBookingIds },
//   }).distinct("tableId");

//   // console.log("bookedTableIds", bookedTableIds);

//   const bookedTableIdSet = new Set(bookedTableIds.map((id) => id.toString()));

//   const availableTables = allTables.filter(
//     (table) => !bookedTableIdSet.has(table._id?.toString())
//   );

//   // console.log("availableTables", availableTables);

//   res.status(200).json(new ApiResponse(200, "", availableTables));
// });

export const getBookingDetailsById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    throw new ApiError(404, "please provide booking id");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(500, "got error while retriving booking");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "booking retrived successfully", booking));
});

export const cancelBooking = asyncHandler(async (req: authorizedUser, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  // commented because middleware is not applied for some purpose
  // const userId = req.user?._id;

  if (!bookingId) {
    throw new ApiError(404, "please provide booking id");
  }

  // first delete related tableBooking of this booking
  const deleteTableBooking = await TableBooking.deleteMany({ bookingId });

  if (!deleteTableBooking) {
    throw new ApiError(
      500,
      "got error while deleting table booking related to booking"
    );
  }

  const bookingDetail = await Booking.findById(bookingId);

  // second delete booking of matched id
  const deleteBooking = await Booking.findByIdAndDelete(bookingId);

  if (!deleteBooking) {
    throw new ApiError(500, "got error while deleting booking");
  }

  const cancelHistory = await BookingCancelation.create({
    bookingId: bookingId,
    canceledBy: bookingDetail.userId,
    reason,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "booking cancled successfully", cancelHistory));
});

export const getBookingOfUser = asyncHandler(
  async (req: authorizedUser, res) => {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    const bookings = await Booking.find({ userId }).sort({
      reservationDateTime: -1,
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, "User bookings fetched successfully", bookings)
      );
  }
);
