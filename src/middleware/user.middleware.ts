import { User } from "../model/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { authorizedUser } from "../types/user.type";

export const verifyUser = asyncHandler(async (req: authorizedUser, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(400, "user unAuthorized");
    }

    const verifyToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as { _id: string };

    const user = await User.findById(verifyToken._id);

    if (!user) {
      throw new ApiError(404, "token is invalid");
    }

    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});