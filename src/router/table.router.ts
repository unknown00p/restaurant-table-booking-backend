import { Router } from "express";

import {
  addTablesToRestaurant,
  deleteTable,
  getAllTablesOfRestaurant,
  updateTableCapacity,
} from "../controller/table.controller";

const tableRouter = Router();

tableRouter
  .route("/addTableToRestaurant/:restaurantId")
  .post(addTablesToRestaurant);
tableRouter.route("/deleteTable/:tableId").post(deleteTable);
tableRouter.route("/getAllTablesOfRestaurant/:restaurantId").get(getAllTablesOfRestaurant);
tableRouter.route("/updateTableCapacity/:tableId").patch(updateTableCapacity);

export default tableRouter;