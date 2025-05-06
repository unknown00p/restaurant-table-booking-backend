import { Router } from "express";
import {
  addRestaurant,
  getRestaurantById,
  removeRestaurant,
  updateCuisine,
  updateName,
  SearchRestaurantWithAvailiblity,
  rateRestaurant,
  getRatingOfRestaurant,
  allowRating
} from "../controller/restaurant.controller";
import { upload } from "../middleware/multer.middleware";

const restaurantRouter = Router();

restaurantRouter.route("/").post(upload.fields([{ name: "mainImage" }, { name: "subImages" }]),addRestaurant)
restaurantRouter.route("/getRestaurantById/:restaurantId").get(getRestaurantById)
restaurantRouter.route("/updateName").patch(updateName)
restaurantRouter.route("/updateCuisine").patch(updateCuisine)
restaurantRouter.route("/SearchRestaurant").post(SearchRestaurantWithAvailiblity)
restaurantRouter.route("/removeRestaurant/:restaurantId").delete(removeRestaurant)
restaurantRouter.route("/rateRestaurant").post(rateRestaurant)
restaurantRouter.route("/getRatingOfRestaurant/:restaurantId").get(getRatingOfRestaurant)
restaurantRouter.route("/allowRating").post(allowRating)

export default restaurantRouter