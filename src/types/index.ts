// Auth Types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role?: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  newConfirmPassword: string;
}

export interface TokenCredentials {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  message: string;
  data: {
    newCredentials: TokenCredentials;
  };
}

export interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  governorate?: string;
  city?: string;
  address?: string;
  phone?: string;
  isConfirmed?: boolean;
}

// Product Types
export interface IImage {
  secure_url: string;
  public_id: string;
}

export interface ICategory {
  _id: string;
  id: string;
  name: string;
  image?: IImage;
  subCategories?: ISubCategory[];
}

export interface ISubCategory {
  _id: string;
  id: string;
  name: string;
  category?: string;
}

export interface IProduct {
  _id: string;
  id: string;
  name: string;
  price: number;
  priceAfterDiscount: number;
  discountAmountProduct: number;
  mainQuantity: number;
  images: IImage[];
  category: {
    _id: string;
    id: string;
    name: string;
  };
  subCategory: {
    _id: string;
    id: string;
    name: string;
  };
  description?: string;
  createdAt?: string;
}

export interface ISlider {
  _id: string;
  id?: string;
  image?: IImage;
  title?: string;
  link?: string;
}

// Cart Types
export interface CartItem {
  _id: string;
  Products: IProduct | string;
  quantity: number;
}

export interface CartData {
  _id: string;
  user: string;
  items: CartItem[];
}

// Service Responses
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  message: string;
  data: {
    products: T[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}
