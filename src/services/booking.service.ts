import mongoose from "mongoose";
import { Booking } from "../model/booking.model";
import { Restaurant } from "../model/restaurant.model";
import { Table } from "../model/table.model";
import { TableBooking } from "../model/tableBooking.model";
import { bookingDataType } from "../types/booking.types";
import { ApiError } from "../utils/apiError";
import {
  addMinutesToTime,
  combineDateAndTime,
  convertStringToDate,
  convertTo24Hour,
  isValidTime,
} from "../utils/formateDateTime";
import { BookingCancelation } from "../model/bookingCancelation.model";
import { LockBooking } from "../model/lockBooking.model";

function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    (result[key] ||= []).push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export const bookTableService = async ({
  restaurantId,
  people,
  reservationDate,
  reservationTime,
  userId,
}: bookingDataType) => {
  if (!restaurantId || !people || !reservationDate || !reservationTime) {
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

  const getBookingDuration = (guests: number) => {
    if (guests <= 2) return 60;
    if (guests <= 4) return 90;
    if (guests <= 8) return 120;
    return 150;
  };

  const timeToStay = getBookingDuration(Number(people));
  const reservationEnd = addMinutesToTime(formattedReservationTime, timeToStay);

  const reservationStartDateTime = combineDateAndTime(
    String(convertedDate),
    formattedReservationTime
  );

  const restaurantClosingDateTime = combineDateAndTime(
    String(convertedDate),
    restaurant.closeTime
  );

  const reservationEndDateTime = combineDateAndTime(
    String(convertedDate),
    reservationEnd
  );

  if (reservationEndDateTime > restaurantClosingDateTime) {
    throw new ApiError(
      404,
      "table for that time in this restaurant is not available"
    );
  }

  // console.table([restaurantId,convertedDate,reservationEnd,formattedReservationTime])
  // console.log(convertedDate)

  const matchedTablesIds = await Booking.aggregate([
    {
      $match: {
        restaurantId,
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

  const randomTable =
    matchedTables[Math.floor(Math.random() * matchedTables.length)];

  // console.log("matchedTables", matchedTables);
  // console.log("randomTable", randomTable);

  const newBooking = await Booking.create({
    restaurantId,
    reservationStartDateTime,
    reservationEndDateTime,
    userId,
    reservationStatus: "confirmed",
  });

  const tableBooking = await TableBooking.create({
    tableId: randomTable._id,
    bookingId: newBooking._id,
    restaurantId,
  });

  return {
    newBooking,
    tableBooking,
  };
};

export const lockTableForBookingService = async ({
  restaurantId,
  userId,
  tableId,
}) => {
  if (!restaurantId || !userId || !tableId) {
    throw new ApiError(404, "all fields are required");
  }

  const locked = await LockBooking.create({
    restaurantId,
    tableId,
    userId,
  });

  if (!locked) {
    throw new ApiError(401, "got error while locking the table");
  }

  return locked;
};

export const unLockTableForBookingService = async ({ userId, tableId }) => {
  if (!userId || !tableId) {
    throw new ApiError(404, "all fields are required");
  }

  const unLocked = await LockBooking.findOneAndDelete({ userId, tableId });

  // if (!unLocked) {
  //   throw new ApiError(401, "got error while unLocking the table");
  // }

  return unLocked;
};

export const selectDineLocationService = async ({
  restaurantId,
  people,
  reservationDate,
  reservationTime,
}) => {
  if (!restaurantId || !people || !reservationDate || !reservationTime) {
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

  const getBookingDuration = (guests: number) => {
    if (guests <= 2) return 60;
    if (guests <= 4) return 90;
    if (guests <= 8) return 120;
    return 150;
  };

  const timeToStay = getBookingDuration(Number(people));
  const reservationEnd = addMinutesToTime(formattedReservationTime, timeToStay);

  const reservationStartDateTime = combineDateAndTime(
    String(convertedDate),
    formattedReservationTime
  );

  const restaurantClosingDateTime = combineDateAndTime(
    String(convertedDate),
    restaurant.closeTime
  );

  const reservationEndDateTime = combineDateAndTime(
    String(convertedDate),
    reservationEnd
  );

  if (reservationEndDateTime > restaurantClosingDateTime) {
    throw new ApiError(
      404,
      "table for that time in this restaurant is not available"
    );
  }

  const matchedTablesIds = await Booking.aggregate([
    {
      $match: {
        restaurantId,
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

  const tableIds = matchedTablesIds.flat().map((id) => {
    return id.toString();
  });

  const tables = await Table.find({ restaurantId });

  const filterdTables = tables.filter(
    ({ _id }) => !tableIds.includes(_id.toString())
  );

  let shortedTables = filterdTables.filter((data) => data.capacity >= people);

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

  const m = await LockBooking.find({ restaurantId });

  const lockedTableIds = new Set(m.map((lock) => lock.tableId?.toString()));

  const filteredTablesByLock = matchedTables.filter(
    (table) => !lockedTableIds.has(table._id.toString())
  );

  // console.log(filteredTablesByLock);

  // if (matchedTables.length == 0) {
  //   console.log("shortedTables", shortedTables);
  //   // Todo --> mearge multiple tables and to fulfill the requirement of the larger party and even after merging the tables if requerment not meets send a message that the
  // }

  const tableGroups = groupBy(filteredTablesByLock, ({ location }) => location);
  const tableGroupsArray = Object.entries(tableGroups).map(
    ([location, tables]) => ({
      location,
      tables,
    })
  );
  // console.log("tableGroupsArray", tableGroupsArray);
  return tableGroupsArray;
};

export const getBookingDetailsByIdService = async (bookingId: string) => {
  if (!bookingId) {
    throw new ApiError(404, "please provide booking id");
  }

  const booking = await Booking.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(bookingId) } },
    {
      $lookup: {
        from: "tablebookings",
        localField: "_id",
        foreignField: "bookingId",
        as: "bookedTables",
      },
    },
  ]);

  if (!booking) {
    throw new ApiError(500, "got error while retriving booking");
  }

  return booking;
};

export const cancelBookingService = async ({
  bookingId,
  reason,
}: {
  bookingId: string;
  reason: string;
}) => {
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

  return cancelHistory;
};

export const getBookingOfUserService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  // const bookings = await Booking.find({ userId }).sort({
  //   reservationDateTime: -1,
  // });

  const booking = await Booking.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "tablebookings",
        localField: "_id",
        foreignField: "bookingId",
        as: "bookedTables",
      },
    },
  ]);

  return booking;
};
