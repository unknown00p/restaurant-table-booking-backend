import { Request, Response, NextFunction } from "express";

const asyncHandler = (asyncFunc: (req: Request, res: Response, next: NextFunction)=> void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(asyncFunc(req, res, next)).catch((error) => next(error));
  };
};

export { asyncHandler };
