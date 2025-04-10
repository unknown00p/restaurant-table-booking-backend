import { Router } from "express";
import {
  addRestaurant,
  getRestaurantById,
  removeRestaurant,
  updateCuisine,
  updateName,
  SearchRestaurant
} from "../controller/restaurant.controller";

const restaurantRouter = Router();

restaurantRouter.route("/").post(addRestaurant)
restaurantRouter.route("/getRestaurantById/:restaurantId").get(getRestaurantById)
restaurantRouter.route("/updateName").patch(updateName)
restaurantRouter.route("/updateCuisine").patch(updateCuisine)
restaurantRouter.route("/SearchRestaurant").get(SearchRestaurant)
restaurantRouter.route("/removeRestaurant/:restaurantId").delete(removeRestaurant)

export default restaurantRouter