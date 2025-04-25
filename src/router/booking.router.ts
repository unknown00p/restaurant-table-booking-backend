import { Router } from "express";
// import { getAvailableTableTime } from '../controller/booking.controller';
import {
  bookTable,
  cancelBooking,
  getBookingDetailsById,
  getBookingOfUser,
} from "../controller/booking.controller";

const bookingRouter = Router();

bookingRouter.route("/").post(bookTable);
bookingRouter.route("/cancelBooking/:bookingId").post(cancelBooking);
// bookingRouter.route("/getAvailableTable").post(getAvailableTableTime);
bookingRouter.route("/getBookingDetailsById/:bookingId").get(getBookingDetailsById);
bookingRouter.route("/getBookingOfUser").get(getBookingOfUser);

export default bookingRouter;
