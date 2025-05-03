export type searchInputTypes = {
  searchTerm: string;
  people?: number;
  reservationDate?: string;
  reservationTime?: string;
};

export type restaurantInputType = {
  name?: string;
  location?: { city?: string; area?: string };
  cuisines?: [string];
  numberOfTables?: number;
  openTime?: string;
  closeTime?: string;
  mainImage: Express.Multer.File[] | { [fieldname: string]: File[] };
  subImages: Express.Multer.File[] | { [fieldname: string]: File[] };
};
