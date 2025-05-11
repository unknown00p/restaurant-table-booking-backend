import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { Request, Response } from "express";
import { authorizedUser } from "../types/user.type";

import {
  signOutService,
  otpConfirmationService,
  refreshAccessTokenService,
  resendOtpService,
  signInAndsignUpService,
  getCurrnentUserService,
} from "../services/auth.service";

export const authCheck = asyncHandler(async (req: Request, res: Response) => {
  return res.status(200).json(new ApiResponse(200, "welcome to auth"));
});

// export const signIn = asyncHandler(async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   const { refreshToken, accessToken, loggedInUser, cookieOption } =
//     await signInService({ email, password });

//   return res
//     .status(200)
//     .cookie("refreshToken", refreshToken, cookieOption)
//     .cookie("accessToken", accessToken, cookieOption)
//     .json(
//       new ApiResponse(200, "user logged in sucessfully", {
//         loggedInUser,
//         refreshToken,
//         accessToken,
//       })
//     );
// });

// export const signUp = asyncHandler(async (req: Request, res: Response) => {
//   // get all the fields for sign up
//   const { email, password } = req.body;
//   const user = signUpService({ email, password });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, "user Signed up sucessfully", user));
// });
export const signInAndSignUp = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const userData = await signInAndsignUpService({ email, password });

    if (userData.type == "signin") {
      const { type, user, accessToken, refreshToken, cookieOption } = userData;
      return res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieOption)
        .cookie("accessToken", accessToken, cookieOption)
        .json(
          new ApiResponse(200, `user logged in sucessfully`, { user, type })
        );
    }

    const { type, user } = userData;

    return res
      .status(200)
      .json(new ApiResponse(200, `user signed up sucessfully`, { user, type }));
  }
);

export const signOut = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    // yet to write
    const userId = req?.user._id;
    const cookieOptions = await signOutService(userId);
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

    const { cookieOption, newAccessToken } = await refreshAccessTokenService({
      incomingRefreshToken,
    });

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

    const { user, accessToken, refreshToken, cookieOption } =
      await otpConfirmationService({ userId, otp });

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOption)
      .cookie("accessToken", accessToken, cookieOption)
      .json(new ApiResponse(200, "user authorized sucessfully", user));
  }
);

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;

  await resendOtpService({ userId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "otp send successfully please check your email")
    );
});

export const getCurrnentUser = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const userId = req?.user._id;
    // console.log(req.user)

    const userData = await getCurrnentUserService({ userId: userId });

    return res.status(200).json(new ApiResponse(200, "user founded", userData));
  }
);

export const getUserById = asyncHandler(
  async (req: authorizedUser, res: Response) => {
    const userId = req.body;
    // console.log(req.user)

    const userData = await getCurrnentUserService({ userId: userId });

    return res.status(200).json(new ApiResponse(200, "user founded", userData));
  }
);
