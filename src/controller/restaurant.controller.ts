import { Response, Request, RequestHandler } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { authorizedUser } from "../types/user.type";

import {
  addRestaurantService,
  allowRatingService,
  getRatingOfRestaurantService,
  getRestaurantByIdService,
  rateRestaurantService,
  removeRestaurantService,
  searchWithAvailabilityService,
  updateCuisineService,
  updateRestaurantNameService,
} from "../services/restaurant.service";

export const addRestaurant = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, city, area, cuisines, numberOfTables, openTime, closeTime } =
      req.body;

    const { mainImage, subImages } = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const location = {
      city,
      area,
    };

    const numberOfTablesConverted = Number(numberOfTables);

    const restaurant = await addRestaurantService({
      name,
      location,
      cuisines,
      numberOfTables: numberOfTablesConverted,
      openTime,
      closeTime,
      mainImage,
      subImages,
    });

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

export const rateRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId, userId, ratingNumber, ratingText } = req.body;

  const resData = await rateRestaurantService({
    restaurantId,
    userId,
    ratingNumber,
    ratingText,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "rating added successfully", resData));
});

export const allowRating = asyncHandler(async (req, res) => {
  const { restaurantId, userId } = req.body;

  const resData = await allowRatingService({ restaurantId, userId });

  res
    .status(200)
    .json(new ApiResponse(200, "rating added successfully", resData));
});

export const getRatingOfRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const resData = await getRatingOfRestaurantService({ restaurantId });

  res
    .status(200)
    .json(new ApiResponse(200, "rating added successfully", resData));
});
