import { Router } from "express";
import { verifyUser } from "../middleware/user.middleware";
import {
  bookTable,
  cancelBooking,
  getBookingDetailsById,
  getBookingOfUser,
  selectDineLocation,
  lockTableForBooking,
  unLockTableForBooking,
} from "../controller/booking.controller";

const bookingRouter = Router();

bookingRouter.route("/").post(bookTable);
bookingRouter.route("/selectDineLocation").post(selectDineLocation);
bookingRouter
  .route("/reserveTableForBooking")
  .post(verifyUser, lockTableForBooking);
bookingRouter
  .route("/unLockTableForBooking")
  .post(verifyUser, unLockTableForBooking);
bookingRouter
  .route("/cancelBooking/:bookingId")
  .post(verifyUser, cancelBooking);
bookingRouter
  .route("/getBookingDetailsById/:bookingId")
  .get(getBookingDetailsById);
bookingRouter.route("/getBookingOfUser").get(verifyUser,getBookingOfUser);

export default bookingRouter;
