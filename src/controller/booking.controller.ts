import { Booking } from "../model/booking.model";
import { Table } from "../model/table.model";
import { TableBooking } from "../model/tableBooking.model";
import { authorizedUser } from "../types/user.type";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const bookTable = asyncHandler(async (req, res) => {
  const { restaurantId, tableId, reservationDateTime, reservationEnd, userId } =
    req.body;

  // commented because middleware is not applied for testing reason

  if (!restaurantId || !tableId || !reservationDateTime || !reservationEnd) {
    throw new ApiError(404, "all fields are required");
  }

  // getAllTables
  const table = await Table.findOne({
    _id: tableId,
    restaurantId,
    isDeleted: { $ne: true },
  });

  if (!table) {
    throw new ApiError(404, "Table not found or has been removed");
  }

  // check for booked tables
  const existingBookingIds = await Booking.find({
    restaurantId,
    reservationDateTime: { $lt: reservationEnd },
    reservationEnd: { $gt: reservationDateTime },
    reservationStatus: "confirmed",
  }).distinct("_id");

  // check if the requested table is available or not
  const isTableBooked = await TableBooking.exists({
    tableId,
    bookingId: { $in: existingBookingIds },
  });

  if (isTableBooked) {
    throw new ApiError(
      409,
      "This table is already booked at the selected time"
    );
  }

  const newBooking = await Booking.create({
    restaurantId,
    reservationDateTime,
    reservationEnd,
    userId,
    reservationStatus: "confirmed",
  });

  const tableBooking = await TableBooking.create({
    tableId,
    bookingId: newBooking._id,
    restaurantId,
  });

  res.status(201).json(
    new ApiResponse(201, "Table booked successfully", {
      booking: newBooking,
      tableBooking,
    })
  );
});

export const getAvailableTable = asyncHandler(async (req, res) => {
  const { restaurantId, reservationDateTime, reservationEnd } = req.body;

  if (!restaurantId || !reservationDateTime || !reservationEnd) {
    throw new ApiError(404, "all fields are required");
  }

  // getAllTables
  const allTables = await Table.find({ restaurantId: restaurantId });

  const overlappingBookingIds = await Booking.find({
    restaurantId,
    reservationDateTime: { $lt: reservationEnd },
    reservationEnd: { $gt: reservationDateTime },
    reservationStatus: "confirmed",
  }).distinct("_id");

  // console.log("overlappingBookingIds", overlappingBookingIds);

  const bookedTableIds = await TableBooking.find({
    bookingId: { $in: overlappingBookingIds },
  }).distinct("tableId");

  // console.log("bookedTableIds", bookedTableIds);

  const bookedTableIdSet = new Set(bookedTableIds.map((id) => id.toString()));

  const availableTables = allTables.filter(
    (table) => !bookedTableIdSet.has(table._id?.toString())
  );

  // console.log("availableTables", availableTables);

  res.status(200).json(new ApiResponse(200, "", availableTables));
});

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

export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

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

  // second delete booking of matched id
  const deleteBooking = await Booking.findByIdAndDelete(bookingId);

  if (!deleteBooking) {
    throw new ApiError(500, "got error while deleting booking");
  }

  res.status(200).json(new ApiResponse(200, "booking cancled successfully"));
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
