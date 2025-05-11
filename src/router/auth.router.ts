import { Router } from "express";
import {
  // signIn,
  // signUp,
  signOut,
  otpConfirmation,
  refreshAccessToken,
  authCheck,
  resendOtp,
  signInAndSignUp,
  getCurrnentUser,
  getUserById,
} from "../controller/auth.controller";
import { verifyUser } from "../middleware/user.middleware";

const authRouter = Router();

authRouter.route("/").get(authCheck);
// authRouter.route("/login").post(signIn);
// authRouter.route("/register").post(signUp);
authRouter.route("/signInAndSignUp").post(signInAndSignUp);
authRouter.route("/logout").post(verifyUser, signOut);
authRouter.route("/otpConfirmation").post(otpConfirmation);
authRouter.route("/refreshAccessToken").post(refreshAccessToken);
authRouter.route("/resendOtp").post(resendOtp);
authRouter.route("/getCurrnentUser").get(verifyUser, getCurrnentUser);
authRouter.route("/getUserById").get(verifyUser, getUserById);

export default authRouter;
