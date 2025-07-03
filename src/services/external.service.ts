import express from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

const router = express.Router();

router.post(
  "/geocordinate",
  asyncHandler(async (req, res, next) => {
    try {
      const { address } = req.body;
      console.log(address)
      const apiKey = process.env.OPENCAGE_API_KEY;

      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(500, "Failed to fetch external data");
      }

      res.status(200).json(
        new ApiResponse(200, "External data fetched successfully", {
          results: data.results[0].geometry
        })
      );
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  "/ipinfo",
  asyncHandler(async (req, res, next) => {
    try {
      const ip = req.ip;
      const apiKey = process.env.IPINFO_API_KEY;

      const response = await fetch(`https://ipinfo.io/${ip}?token=${apiKey}`);

      const data = await response.json();

      console.log(data)

      if (!response.ok) {
        throw new ApiError(500, "Failed to fetch external data");
      }

      res.status(200).json(
        new ApiResponse(200, "External data fetched successfully", {
          results: data
        })
      );
    } catch (error) {
      console.log(error)
    }
  })
);

export default router;