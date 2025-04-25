import { Response, Request, RequestHandler } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { authorizedUser } from "../types/user.type";
import {
  addRestaurantService,
  getRestaurantByIdService,
  removeRestaurantService,
  searchWithAvailabilityService,
  updateCuisineService,
  updateRestaurantNameService,
} from "../services/restaurant.service";

export const addRestaurant = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const restaurant = await addRestaurantService(req.body);

    res
      .status(200)
      .json(new ApiResponse(200, "added restaurant successfully", restaurant));
  }
);

export const getRestaurantById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await getRestaurantByIdService(restaurantId);

  res
    .status(200)
    .send(new ApiResponse(200, "retrived restaurant successfully", restaurant));
});

export const updateName = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const restaurant = await updateRestaurantNameService(req.body);

    res
      .status(200)
      .json(new ApiResponse(200, "name update successfully", restaurant));
  }
);

export const updateCuisine = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const updatedCuisine = await updateCuisineService(req.body);

    res
      .status(200)
      .json(
        new ApiResponse(200, "cuisine update successfully", updatedCuisine)
      );
  }
);

export const removeRestaurant = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const deleteRestaurant = await removeRestaurantService(req.body);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "deleted restaurant and related tables and bookings successfully",
          deleteRestaurant
        )
      );
  }
);

export const SearchRestaurantWithAvailiblity: RequestHandler = asyncHandler(
  async (req, res) => {
    const restaurants = await searchWithAvailabilityService(req.body);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Restaurants fetched successfully", restaurants)
      );
  }
);