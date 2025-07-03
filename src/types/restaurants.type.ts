export type searchInputTypes = {
  searchTerm: string;
  people?: number;
  reservationDate?: string;
  reservationTime?: string;
};

export type restaurantInputType = {
  name?: string;
  city: string;
  area: string;
  mainCuisine?: {
    name: string;
    menu: string[];
  };
  subCuisines?: {
    name: string;
    menu: string[];
  }[];
  expenseType?: "Low" | "Medium" | "High" | "Expensive";
  executiveChef?: string;
  paymentOptions?: string[];
  dressCode?: "Casual" | "Smart Casual" | "Business Casual" | "Formal";
  numberOfTables?: number;
  openTime?: string;
  closeTime?: string;
  mainImage: Express.Multer.File[] | { [fieldname: string]: File[] };
  subImages: Express.Multer.File[] | { [fieldname: string]: File[] };
  minimumDeposite: number;
  policies: string[];
  contactNo: string;
  description: string;
};
