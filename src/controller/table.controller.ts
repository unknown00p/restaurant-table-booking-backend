import { Table } from "../model/table.model";
import { TableBooking } from "../model/tableBooking.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Booking } from "../model/booking.model";
import { Restaurant } from "../model/restaurant.model";
import mongoose from "mongoose";

export const getAllTablesOfRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    throw new ApiError(404, "please provide restaurant id");
  }

  const tables = await Table.find({ restaurantId: restaurantId });

  if (!tables) {
    throw new ApiError(500, "got error while retriving the tables");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "tables retrived successfully", tables));
});

export const addTableToRestaurant = asyncHandler(async (req, res) => {
  const { totalTableToAdd, capacity } = req.body;
  const { restaurantId } = req.params;

  if (!totalTableToAdd || !restaurantId || !capacity) {
    throw new ApiError(400, "All fields are required");
  }

  // console.log(restaurantId)

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  const currentTableCount = restaurant.numberOfTables;
  const newTables = [];

  for (let i = 0; i < totalTableToAdd; i++) {
    newTables.push({
      tableNumber: `T${currentTableCount + i + 1}`,
      restaurantId: restaurantId,
      capacity: capacity,
    });
  }

  await Table.insertMany(newTables);

  restaurant.numberOfTables += totalTableToAdd;
  await restaurant.save();

  res.status(200).json(
    new ApiResponse(200, "Tables added successfully", {
      totalTables: restaurant.numberOfTables,
      added: newTables.length,
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
      isDeleted: true,
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
