import { Table } from "../model/table.model";
import { TableBooking } from "../model/tableBooking.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../model/booking.model";
import { Restaurant } from "../model/restaurant.model";
import mongoose from "mongoose";
import { tableFeilds } from "../types/table.type";

export const getAllTablesOfRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    throw new ApiError(404, "please provide restaurant id");
  }

  const tables = await Table.find({ restaurantId: restaurantId });

  if (tables.length === 0) {
    return res.status(200).json(new ApiResponse(200, "No tables found", []));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "tables retrived successfully", tables));
});

export const addTablesToRestaurant = asyncHandler(async (req, res) => {
  const data = req.body;
  const { restaurantId } = req.params;
  // console.log("data", data);

  const validStatuses = ["active", "inactive"];
  const validLocations = ["window", "corner", "near door", "center"];

  data.forEach((table: tableFeilds, index) => {
    if (
      !table.tableNumber ||
      !restaurantId ||
      !table.capacity ||
      !table.status ||
      !table.location
    ) {
      throw new ApiError(
        400,
        `All fields are required for table at index ${index}`
      );
    }

    if (!validStatuses.includes(table.status)) {
      throw new ApiError(400, `Invalid status at index ${index}`);
    }

    if (!validLocations.includes(table.location)) {
      throw new ApiError(400, `Invalid location at index ${index}`);
    }
  });

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const existingTables = await Table.find({
    restaurantId,
    tableNumber: { $in: data.map((t) => t.tableNumber) },
  });

  if (existingTables.length) {
    throw new ApiError(
      400,
      `Duplicate tableNumbers found: ${existingTables
        .map((t) => t.tableNumber)
        .join(", ")}`
    );
  }

  // let tableCount = restaurant.numberOfTables;

  // if (!tableCount) {
  //   await Restaurant.findByIdAndUpdate(restaurantId, {
  //     numberOfTables: data.length,
  //   });
  // } else {
  // const mergedTableCount = (tableCount += data.length);

  // await Restaurant.findByIdAndUpdate(restaurantId, {
  //   numberOfTables: mergedTableCount,
  // });
  // }

  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { numberOfTables: data.length },
  });

  const tablesToInsert = data.map((table) => ({
    ...table,
    restaurantId: restaurantId,
  }));

  const insertedTables = await Table.insertMany(tablesToInsert);

  res.status(200).json(
    new ApiResponse(200, "Tables added successfully", {
      insertedTables,
      added: data.length,
    })
  );
});

export const deleteTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;

  if (!tableId) {
    throw new ApiError(404, "table id is required");
  }

  const deleteTable = await Table.findByIdAndUpdate(
    tableId,
    {
      status: "inactive",
    },
    { new: true }
  );

  if (!deleteTable) {
    throw new ApiError(500, "got error while deleting the table");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "table deleted successfully", deleteTable));
});

export const updateTableCapacity = asyncHandler(async (req, res) => {
  const { capacity } = req.body;
  const { tableId } = req.params;

  if (!tableId || !capacity) {
    throw new ApiError(404, "all feilds are required");
  }

  const updateCapacity = await Table.findByIdAndUpdate(
    { _id: tableId },
    { capacity },
    { new: true }
  );

  if (!updateCapacity) {
    throw new ApiError(500, "got error while updating table capicity");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "capacity updated successfully", updateCapacity)
    );
});

// export const deleteTable = asyncHandler(async (req, res) => {
//   const { tableId } = req.params;

//   if (!tableId) {
//     throw new ApiError(404, "please provide table id");
//   }

//   const deleteTable = await Table.findByIdAndDelete({ _id: tableId });

//   if (!deleteTable) {
//     throw new ApiError(500, "table deleted successfully");
//   }

//   res.status(200).json(new ApiResponse(200, "deleted table successfully"));
// });
