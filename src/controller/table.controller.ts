import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addTablesToRestaurantService,
  deleteTableService,
  getAllTablesOfRestaurantService,
  updateTableCapacityService,
} from "../services/table.service";

export const getAllTablesOfRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const tables = getAllTablesOfRestaurantService({ restaurantId });

  res
    .status(200)
    .json(new ApiResponse(200, "tables retrived successfully", tables));
});

export const addTablesToRestaurant = asyncHandler(async (req, res) => {
  const data = req.body;
  const { restaurantId } = req.params;
  // console.log("data", data);

  const insertedTables = addTablesToRestaurantService({ data, restaurantId });

  res.status(200).json(
    new ApiResponse(200, "Tables added successfully", {
      insertedTables,
      added: data.length,
    })
  );
});

export const deleteTable = asyncHandler(async (req, res) => {
  const { tableId } = req.params;
  const deleteTable = deleteTableService({ tableId });

  res
    .status(200)
    .json(new ApiResponse(200, "table deleted successfully", deleteTable));
});

export const updateTableCapacity = asyncHandler(async (req, res) => {
  const { capacity } = req.body;
  const { tableId } = req.params;

  const updateCapacity = await updateTableCapacityService({
    capacity,
    tableId,
  });

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
