import { Order } from '../../orders/schemas/order.schema';
import { ShippingAddress } from '../../orders/schemas/order.schema';

export interface CustomerStatsDto {
  totalOrders: number;
  totalSpent: number;
  activeOrdersCount: number;
  savedAddressesCount: number;
  favoritesCount: number;
}

export interface CustomerDashboardDto {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    role: string;
    createdAt?: Date;
  };
  stats: CustomerStatsDto;
  recentOrders: Order[];
  savedAddresses: ShippingAddress[];
  favoriteProductIds: string[];
}

export interface IUserDashboardService {
  getCustomerDashboard(userId: string): Promise<CustomerDashboardDto>;
}
