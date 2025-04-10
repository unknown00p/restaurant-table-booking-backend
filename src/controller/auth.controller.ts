import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { Request, Response } from "express";
import { User } from "../model/user.model";
import { ApiError } from "../utils/apiError";
import { generateOTP } from "../utils/otpGenrator";
import { emailSender } from "../lib/emailSender";
import { Otp } from "../model/otp.model";
import jwt from "jsonwebtoken";
import { authorizedUser } from "../types/user.type";

export const authCheck = asyncHandler(async (req: Request, res: Response) => {
  return res.status(200).json(new ApiResponse(200, "welcome to auth"));
});

export const signIn = asyncHandler(async (req: Request, res: Response) => {
  // yet to write

  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(404, "all fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user does not exists");
  }

  if (!user.emailVerified) {
    throw new ApiError(400, "user is unAuthorized please authorize first");
  }

  const checkPassValid = await user.isPasswordCorrect(password);
  console.log(checkPassValid);

  if (!checkPassValid) {
    throw new ApiError(400, "password is incorrect");
  }

  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  // console.log(accessToken);
  // console.log(refreshToken);

  const loggedInUser = await User.findById(user?._id).select("-password");

  const cookieOption = {
    secure: true,
    httpOnly: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOption)
    .cookie("accessToken", accessToken, cookieOption)
    .json(
      new ApiResponse(200, "user logged in sucessfully", {
        loggedInUser,
        refreshToken,
        accessToken,
      })
    );
});

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  // get all the fields for sign up
  const { email, password } = req.body;

  // check if any of the fields is missing
  if (!email || !password) {
    throw new ApiError(400, "all fields are required");
  }

  // check if the user already exists in database
  const isUser = await User.findOne({ email });

  // if user exists and user is authorized then throw an error
  if (isUser?.emailVerified) {
    throw new ApiError(403, "user already exists");
  }

  // create user if user does not exists
  let user = isUser;
  if (!isUser) {
    user = await User.create({
      email,
      password,
      emailVerified: false,
    });

    if (!user) {
      throw new ApiError(405, "got error while creating user in database");
    }
  }

  // genrate OTP for user varification
  const otp = generateOTP();
  // console.log(otp)
  await emailSender(email, otp)
    .then(() => console.log("OTP sent successfully!"))
    .catch((err) => console.error("Error sending email:", err));

  if (!user || !user._id) {
    throw new ApiError(400, "User not found or invalid");
  }

  // check if otp already exists and delete it
  await Otp.findOneAndDelete({ email });

  // add otp to database
  const createOtp = await Otp.create({
    userId: user?._id,
    otpCode: otp,
  });

  if (!createOtp) {
    throw new ApiError(405, "got error while creating otp in database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "user Signed up sucessfully", user));
});

export const signOut = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    // yet to write
    const userId = req?.user._id;

    if (!userId) {
      throw new ApiError(404, "user does not exists");
    }

    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    res
      .send(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, "user logged out successfully"));
  }
);

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    // console.log("lol");
    // yet to write
    const incomingRefreshToken =
      req?.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(404, "refreshToken not found");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, "user does not exists");
    }

    const newAccessToken = user.generateAccessToken();

    const cookieOption = {
      secure: true,
      httpOnly: true,
    };

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, cookieOption)
      .json(new ApiResponse(200, "accessToken refreshed sucessfully"));
  }
);

export const otpConfirmation = asyncHandler(
  async (req: Request, res: Response) => {
    // yet to write
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      throw new ApiError(400, "all fields are required");
    }

    const dbOtp = await Otp.findOne({ userId });

    if (!dbOtp) {
      throw new ApiError(405, "otp does not exists in DB");
    }

    if (otp !== dbOtp?.otpCode) {
      throw new ApiError(400, "please provide correct OTP");
    }

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      throw new ApiError(400, "unable to retrive and update user");
    }

    await Otp.findOneAndDelete({ userId });

    return res
      .status(200)
      .json(new ApiResponse(200, "user authorized sucessfully", user));
  }
);

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(404, "userId is undefined");
  }

  // check if otp already exists and delete it
  await Otp.findOneAndDelete({ userId });

  const user = await User.findOne({ _id: userId });

  const otp = generateOTP();

  await emailSender(user?.email, otp)
    .then(() => console.log("OTP sent successfully!"))
    .catch((err) => console.error("Error sending email:", err));

  // add otp to database
  const createOtp = await Otp.create({
    userId,
    otpCode: otp,
  });

  if (!createOtp) {
    throw new ApiError(405, "got error while creating otp in database");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "otp send successfully please check your email")
    );
});
