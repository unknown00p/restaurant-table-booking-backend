export type bookingDataType = {
  firstName:string;
  lastName:string;
  email:string;
  phone:number;
  SpecialOccasion?:string;
  AccessibilityNeeds?:string;
  restaurantId?: string;
  tableId: string;
  reservationDate?: string;
  reservationTime?: string;
  userId?: string;
  partySize: number;
};
