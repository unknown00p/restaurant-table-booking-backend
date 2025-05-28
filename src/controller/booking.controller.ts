import { authorizedUser } from "../types/user.type";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
  bookTableService,
  cancelBookingService,
  getBookingDetailsByIdService,
  getBookingOfUserService,
  lockTableForBookingService,
  selectDineLocationService,
  unLockTableForBookingService,
} from "../services/booking.service";

export const bookTable = asyncHandler(async (req: authorizedUser, res) => {
  const { restaurantId, tableId, reservationDate, reservationTime, partySize } =
    req.body;

  const userId = req?.user.id;
  const { tableBooking, newBooking } = await bookTableService({
    restaurantId,
    tableId,
    reservationDate,
    reservationTime,
    partySize,
    userId
  });

  res.status(201).json(
    new ApiResponse(201, "Table booked successfully", {
      booking: newBooking,
      tableBooking,
    })
  );
});

export const selectDineLocation = asyncHandler(async (req, res) => {
  const dineLocations = await selectDineLocationService(req.body);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "dining location fetched successfully",
        dineLocations
      )
    );
});

export const lockTableForBooking = asyncHandler(
  async (req: authorizedUser, res) => {
    const userId = req.user.id;
    const { restaurantId, tableId } = req.body;
    const locked = await lockTableForBookingService({
      restaurantId,
      tableId,
      userId,
    });

    res
      .status(201)
      .json(new ApiResponse(201, "Table locked successfully", locked));
  }
);

export const unLockTableForBooking = asyncHandler(
  async (req: authorizedUser, res) => {
    const { tableId } = req.body;
    const userId = req.user.id;
    const locked = await unLockTableForBookingService({ tableId, userId });

    res
      .status(201)
      .json(new ApiResponse(201, "Table unLocked successfully", locked));
  }
);

export const getBookingDetailsById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await getBookingDetailsByIdService(bookingId);

  res
    .status(200)
    .json(new ApiResponse(200, "booking retrived successfully", booking));
});

export const cancelBooking = asyncHandler(async (req: authorizedUser, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;

  // commented because middleware is not applied for some purpose
  // const userId = req.user?._id;
  const cancelHistory = await cancelBookingService({ bookingId, reason });

  res
    .status(200)
    .json(new ApiResponse(200, "booking cancled successfully", cancelHistory));
});

export const getBookingOfUser = asyncHandler(
  async (req: authorizedUser, res) => {
    const userId = req.user?._id;
    // const userId = req.params

    const booking = await getBookingOfUserService({ userId });

    res
      .status(200)
      .json(
        new ApiResponse(200, "User bookings fetched successfully", booking)
      );
  }
);

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
