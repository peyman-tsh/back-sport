import { Order } from '../../orders/schemas/order.schema';

export interface LowStockAlertItem {
  id: string;
  title: string;
  slug: string;
  stock: number;
  price: number;
  category: string;
}

export interface AdminDashboardSummaryDto {
  financial: {
    totalRevenue: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    averageOrderValue: number;
  };
  orders: {
    totalOrders: number;
    paidOrdersCount: number;
    pendingOrdersCount: number;
  };
  inventory: {
    totalProducts: number;
    totalUnitsInStock: number;
    inventoryValuation: number;
    lowStockCount: number;
    outOfStockCount: number;
    lowStockAlerts: LowStockAlertItem[];
  };
  customers: {
    totalCustomers: number;
  };
  recentOrders: Order[];
}

export interface IAdminDashboardService {
  getDashboardSummary(): Promise<AdminDashboardSummaryDto>;
}
