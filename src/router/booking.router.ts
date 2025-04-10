import { Router } from "express";
import {
  bookTable,
  cancelBooking,
  getAvailableTable,
  getBookingDetailsById,
  getBookingOfUser,
} from "../controller/booking.controller";

const bookingRouter = Router();

bookingRouter.route("/").post(bookTable);
bookingRouter.route("/cancelBooking/:bookingId").post(cancelBooking);
bookingRouter.route("/getAvailableTable").post(getAvailableTable);
bookingRouter.route("/getBookingDetailsById/:bookingId").get(getBookingDetailsById);
bookingRouter.route("/getBookingOfUser").get(getBookingOfUser);

export default bookingRouter;
