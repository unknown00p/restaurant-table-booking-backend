import { Response, Request, RequestHandler } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { Restaurant } from "../model/restaurant.model";
import { ApiResponse } from "../utils/apiResponse";
import { authorizedUser } from "../types/user.type";
import { Table } from "../model/table.model";
import { TableBooking } from "../model/tableBooking.model";
import { Booking } from "../model/booking.model";

export const addRestaurant = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { name, location, cuisines, numberOfTables, tableCapacity } =
      req.body;

    const restaurant = await Restaurant.findOne({ name });

    if (restaurant && restaurant.location == location) {
      throw new ApiError(
        400,
        "restaurant with same name and location already exists"
      );
    }

    // commented for now because middlerware not applied
    // const user = req.user;
    // if (user.role !== "admin") {
    //   throw new ApiError(
    //     401,
    //     "user does not have permission to add restaurant"
    //   );
    // }

    if (!name || !location || !cuisines || !numberOfTables) {
      throw new ApiError(404, "all feilds are required");
    }

    const addedRestaurant = await Restaurant.create({
      name,
      location,
      cuisines,
      numberOfTables,
    });

    if (!addedRestaurant) {
      throw new ApiError(500, "got error while adding restaurant");
    }

    for (let i = 0; i < addedRestaurant.numberOfTables; i++) {
      await Table.create({
        tableNumber: `T${i + 1}`,
        restaurantId: addedRestaurant._id,
        capacity: tableCapacity,
      });
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "added restaurant successfully", addedRestaurant)
      );
  }
);

export const getRestaurantById = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    throw new ApiError(404, "please provide restaurant id");
  }

  const restaurant = await Restaurant.findOne({ _id: restaurantId });

  if (!restaurant) {
    throw new ApiError(500, "restaurant not found");
  }

  res
    .status(200)
    .send(new ApiResponse(200, "retrived restaurant successfully", restaurant));
});

export const updateName = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { newName, restaurantId } = req.body;

    // commented for now because middlerware not applied
    // const user = req.user;
    // if (user.role !== "admin") {
    //   throw new ApiError(
    //     401,
    //     "user does not have permission to add restaurant"
    //   );
    // }

    if (!newName || !restaurantId) {
      throw new ApiError(404, "all feilds are required");
    }

    const updateName = await Restaurant.findByIdAndUpdate(
      { _id: restaurantId },
      { name: newName },
      { new: true }
    );

    if (!updateName) {
      throw new ApiError(500, "got error while updating the name");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "name update successfully", updateName));
  }
);

export const updateCuisine = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { cuisines, restaurantId } = req.body;

    // commented for now because middlerware not applied
    // const user = req.user;
    // if (user.role !== "admin") {
    //   throw new ApiError(
    //     401,
    //     "user does not have permission to add restaurant"
    //   );
    // }

    if (!cuisines || !restaurantId) {
      throw new ApiError(404, "all feilds are required");
    }

    const updatedCuisine = await Restaurant.findByIdAndUpdate(
      { _id: restaurantId },
      { cuisines },
      { new: true }
    );

    if (!updatedCuisine) {
      throw new ApiError(500, "got error while updating the cuisine");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "cuisine update successfully", updatedCuisine)
      );
  }
);

// export const updateNumberOfTables = asyncHandler(
//   async (req: authorizedUser, res: Response) => {
//     const { numberOfTables, restaurantId } = req.body;

//     // commented for now because middlerware not applied
//     // const user = req.user;
//     // if (user.role !== "admin") {
//     //   throw new ApiError(
//     //     401,
//     //     "user does not have permission to add restaurant"
//     //   );
//     // }

//     if (!numberOfTables || !restaurantId) {
//       throw new ApiError(404, "all feilds are required");
//     }

//     const previousTableNo = await Restaurant.findById({_id: restaurantId})

//     if (previousTableNo < numberOfTables) {

//     }

//     const updateNumberOfTables = await Restaurant.findByIdAndUpdate(
//       { _id: restaurantId },
//       { numberOfTables },
//       { new: true }
//     );

//     if (!updateNumberOfTables) {
//       throw new ApiError(500, "got error while updating the cuisine");
//     }

//     res
//       .status(200)
//       .json(
//         new ApiResponse(200, "tables update successfully", updateNumberOfTables)
//       );
//   }
// );

export const removeRestaurant = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const { restaurantId } = req.params;
    console.log("params", restaurantId);

    // commented for now because middlerware not applied
    // const user = req.user;
    // if (user.role !== "admin") {
    //   throw new ApiError(
    //     401,
    //     "user does not have permission to add restaurant"
    //   );
    // }

    if (!restaurantId) {
      throw new ApiError(404, "please provide restaurantId");
    }

    const deleteRestaurant = await Restaurant.findOneAndDelete({
      _id: restaurantId,
    });

    if (!deleteRestaurant) {
      throw new ApiError(500, "got error while deleting restaurant");
    }

    // delete all the table and booking related to that restaurant
    const tableIds = await Table.find({ restaurantId }).distinct("_id");

    const deleteTableBookings = await TableBooking.deleteMany({ restaurantId });
    if (!deleteTableBookings) {
      throw new ApiError(
        500,
        "Failed to delete table bookings for the restaurant."
      );
    }

    const deleteBooking = await Booking.deleteMany({ restaurantId });
    if (!deleteBooking) {
      throw new ApiError(500, "Failed to delete bookings for the restaurant.");
    }

    const deleteTables = await Table.deleteMany({ _id: tableIds });
    if (!deleteTables) {
      throw new ApiError(500, "Failed to delete tables for the restaurant.");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "deleted restaurant and related tables and bookings successfully"
        )
      );
  }
);


type SearchQuery = {
  name?: string;
  location?: string;
  cuisine?: string;
};

export const SearchRestaurant: RequestHandler = asyncHandler(
  async (req, res) => {
    const { name, location, cuisine } = req.query as SearchQuery;

    const query: any = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (cuisine) {
      query.cuisine = { $regex: cuisine, $options: "i" };
    }

    const restaurants = await Restaurant.find(query);

    res
      .status(200)
      .json(
        new ApiResponse(200, "Restaurants fetched successfully", restaurants)
      );
  }
);
