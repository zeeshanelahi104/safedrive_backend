export interface IAddress {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}
export interface IBillingDetails {
  cardHolderName: string;
  cardType: "American Express" | "VISA" | "MasterCard";
  expirationDate: string; // Format: MM/YY
  last4: string 
}
export interface ISelectedRide {
  carName: string;
  baseRate: number;
  donation: number;
  totalRate: number;
  imageUrl: string;
}
export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: IAddress;
  stripeCustomerId?: string;
  paymentMethodId?: string | "";
  setupIntentClientSecret?: string;
  role?: "user" | "driver" | "admin";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  selectedReservations?: {
    reservation: IRideQuote;
    paymentIntentId?: string;
  }[];
  billingDetails?: IBillingDetails;
}

export interface ILocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface IRideQuote {
  pickup: ILocation;
  destination: ILocation;
  stop: ILocation;
  persons: number;
  pickupDate: string;
  pickupTime: string;
  returnPickupTime?: string;
  additionalInfo?: string;
  rideType: string;
  notificationType: string;
  status?: string;
  paymentMethod?: string;
  mapLocation: ILocation;
  createdAt?: Date;
  updatedAt?: Date;
  selectedRide?: ISelectedRide;
}
