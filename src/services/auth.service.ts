import { emailSender } from "../lib/emailSender";
import { Otp } from "../model/otp.model";
import { User } from "../model/user.model";
import { ApiError } from "../utils/apiError";
import { generateOTP } from "../utils/otpGenrator";
import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";

// export const signInService = async ({
//   email,
//   password,
// }: {
//   email: string;
//   password: string;
// }) => {
//   if (!email || !password) {
//     throw new ApiError(404, "all fields are required");
//   }
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new ApiError(404, "user does not exists");
//   }

//   if (!user.emailVerified) {
//     throw new ApiError(400, "user is unAuthorized please authorize first");
//   }

//   const checkPassValid = await user.isPasswordCorrect(password);
//   console.log(checkPassValid);

//   if (!checkPassValid) {
//     throw new ApiError(400, "password is incorrect");
//   }

//   const refreshToken = await user.generateRefreshToken();
//   const accessToken = await user.generateAccessToken();

//   const loggedInUser = await User.findById(user?._id).select("-password");

//   const cookieOption = {
//     secure: true,
//     httpOnly: true,
//   };

//   return {
//     refreshToken,
//     accessToken,
//     loggedInUser,
//     cookieOption,
//   };
// };

// export const signUpService = async ({
//   email,
//   password,
// }: {
//   email: string;
//   password: string;
// }) => {
//   // check if any of the fields is missing
//   if (!email || !password) {
//     throw new ApiError(400, "all fields are required");
//   }

//   // check if the user already exists in database
//   const isUser = await User.findOne({ email });

//   // if user exists and user is authorized then throw an error
//   if (isUser?.emailVerified) {
//     throw new ApiError(403, "user already exists");
//   }

//   // create user if user does not exists
//   let user = isUser;
//   if (!isUser) {
//     user = await User.create({
//       email,
//       password,
//       emailVerified: false,
//     });

//     if (!user) {
//       throw new ApiError(405, "got error while creating user in database");
//     }
//   }

//   // genrate OTP for user varification
//   const otp = generateOTP();
//   // console.log(otp)
//   await emailSender(email, otp)
//     .then(() => console.log("OTP sent successfully!"))
//     .catch((err) => console.error("Error sending email:", err));

//   if (!user || !user._id) {
//     throw new ApiError(400, "User not found or invalid");
//   }

//   // check if otp already exists and delete it
//   await Otp.findOneAndDelete({ userId: user?._id });

//   // add otp to database
//   const createOtp = await Otp.create({
//     userId: user?._id,
//     otpCode: otp,
//   });

//   if (!createOtp) {
//     throw new ApiError(405, "got error while creating otp in database");
//   }

//   return user;
// };

// export const signInAndsignUpService = async ({
//   email,
//   password,
// }: {
//   email: string;
//   password: string;
// }) => {
//   if (!email || !password) {
//     throw new ApiError(400, "all fields are required");
//   }
//   const isUser = await User.findOne({ email });

//   if (!isUser) {
//     const res = await signUpService({ email, password });

//     return {
//       type: "signup",
//       user: res,
//     };
//   }

//   if (isUser && !isUser.emailVerified) {
//     throw new ApiError(400, "user is unAuthorized please authorize first");
//   }

//   const res = await signInService({ email, password });
//   return {
//     type: "signin",
//     cookieOption: res.cookieOption,
//     refreshToken: res.refreshToken,
//     accessToken: res.accessToken,
//     user: res.loggedInUser,
//   };
// };

export const signInAndsignUpService = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  if (!email || !password) {
    throw new ApiError(400, "all fields are required");
  }
  const isUser = await User.findOne({ email });

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

    return {
      type: "signup",
      user: user,
    };
  }

  if (isUser && !isUser.emailVerified) {
    const res = await resendOtpService({userId: isUser?._id})

    return {
      type: "verify",
      message: res.message,
      user: isUser,
    };
  } else {
    const checkPassValid = await user.isPasswordCorrect(password);

    if (!checkPassValid) {
      throw new ApiError(400, "password is incorrect");
    }

    const refreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    const loggedInUser = await User.findById(user?._id).select("-password");

    const cookieOption: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    return {
      type: "signin",
      user: loggedInUser,
      refreshToken,
      accessToken,
      cookieOption,
    };
  }
};

export const signOutService = async (userId) => {
  if (!userId) {
    throw new ApiError(404, "user does not exists");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return cookieOptions;
};

export const refreshAccessTokenService = async ({ incomingRefreshToken }) => {
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

  const cookieOption: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return {
    newAccessToken,
    cookieOption,
  };
};

export const otpConfirmationService = async ({ userId, otp }) => {
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

  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  const cookieOption: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return {
    user,
    refreshToken,
    accessToken,
    cookieOption,
  };
};

export const resendOtpService = async ({ userId }) => {
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

  return {
    message: 'otp sended successfully'
  }
};

export const getCurrnentUserService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(400, "user is unAuthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "userId is incorrect");
  }

  return user;
};

export const getUserByIdService = async ({ userId }) => {
  if (!userId) {
    throw new ApiError(400, "user is unAuthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "userId is incorrect");
  }

  return user;
};
