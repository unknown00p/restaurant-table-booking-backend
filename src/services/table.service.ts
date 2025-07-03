import { Restaurant } from "../model/restaurant.model";
import { Table } from "../model/table.model";
import { tableFeilds } from "../types/table.type";
import { ApiError } from "../utils/apiError";

export const getAllTablesOfRestaurantService = async ({ restaurantId }) => {
  if (!restaurantId) {
    throw new ApiError(404, "please provide restaurant id");
  }

  const tables = await Table.find({ restaurantId: restaurantId });

  if (tables.length === 0) {
    throw new ApiError(200, "No tables found");
  }

  return tables;
};

export const addTablesToRestaurantService = async ({ data, restaurantId }) => {
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

  await Restaurant.findByIdAndUpdate(restaurantId, {
    $inc: { numberOfTables: data.length },
  });

  const tablesToInsert = data.map((table) => ({
    ...table,
    restaurantId: restaurantId,
  }));

  const insertedTables = await Table.insertMany(tablesToInsert);

  return insertedTables;
};

export const deleteTableService = async ({ tableId }) => {
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

  return deleteTable;
};

export const updateTableCapacityService = async ({ tableId, capacity }) => {
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

  return updateCapacity
};