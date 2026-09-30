export type UserRole = 'CUSTOMER' | 'SHOPKEEPER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
  shops?: ShopSummary[];
}

export interface ShopSummary {
  id: string;
  name: string;
  slug: string;
  isApproved: boolean;
  location?: ShopLocation;
}

export interface Mall {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  totalFloors: number;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  mallId: string;
  floorNumber: string;
  floorName: string;
}

export interface ShopLocation {
  id: string;
  shopId: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  mallId?: string | null;
  floorId?: string | null;
  mall?: Mall | null;
  floor?: Floor | null;
  floorName?: string | null;
  shopNumber?: string | null;
  section?: string | null;
  nearbyLandmark?: string | null;
  indoorDirections?: string | null;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone: string;
  email?: string;
  openingHours?: string;
  isApproved: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  ownerId: string;
  location?: ShopLocation;
  products?: Product[];
  _count?: {
    products?: number;
    reservations?: number;
    reviews?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  _count?: {
    products?: number;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  shopId: string;
  categoryId: string;
  material: string;
  color: string;
  size: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  images: ProductImage[];
  category?: Category;
  shop?: Shop;
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'READY_FOR_VISIT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface Reservation {
  id: string;
  reservationCode: string;
  customerId: string;
  shopId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  status: ReservationStatus;
  preferredVisitDate: string;
  preferredVisitTime?: string;
  notes?: string;
  cancelReason?: string;
  expiresAt: string;
  completedAt?: string | null;
  createdAt: string;
  product: Product;
  shop: Shop;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'RESERVATION_UPDATE' | 'STOCK_ALERT' | 'SHOP_APPROVAL' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface CityLocation {
  city: string;
  state: string;
  shopCount: number;
}
