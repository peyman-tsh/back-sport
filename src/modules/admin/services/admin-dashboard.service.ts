import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IProductRepository } from '../../products/interfaces/product-repository.interface';
import { IOrderRepository } from '../../orders/interfaces/order-repository.interface';
import { IUserRepository } from '../../users/interfaces/user-repository.interface';
import {
  IAdminDashboardService,
  AdminDashboardSummaryDto,
  LowStockAlertItem,
} from '../interfaces/admin-dashboard.interface';

/**
 * Single Responsibility Principle (SRP):
 * AdminDashboardService is strictly responsible for gathering and computing
 * business intelligence KPIs, financial stats, inventory alerts, and order breakdowns.
 *
 * Dependency Inversion Principle (DIP):
 * Relies on abstract repositories via INJECTION_TOKENS, decoupled from concrete databases.
 */
@Injectable()
export class AdminDashboardService implements IAdminDashboardService {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(INJECTION_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async getDashboardSummary(): Promise<AdminDashboardSummaryDto> {
    const [allProductsPaginated, financialStats, ordersPaginated, usersPaginated] =
      await Promise.all([
        this.productRepository.findAll({}, { page: 1, limit: 1000 }),
        this.orderRepository.getFinancialStats(),
        this.orderRepository.findFiltered({}, { page: 1, limit: 10 }),
        this.userRepository.findAll({}, { page: 1, limit: 1 }),
      ]);

    const products = allProductsPaginated.data;
    const totalProducts = products.length;

    let totalUnitsInStock = 0;
    let inventoryValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockAlerts: LowStockAlertItem[] = [];

    for (const p of products) {
      const stock = p.stock || 0;
      totalUnitsInStock += stock;
      inventoryValuation += stock * (p.price || 0);

      if (stock === 0) {
        outOfStockCount++;
        lowStockAlerts.push({
          id: p.id || (p as any)._id?.toString(),
          title: p.title,
          slug: p.slug,
          stock: 0,
          price: p.price,
          category: p.category,
        });
      } else if (stock <= 5) {
        lowStockCount++;
        lowStockAlerts.push({
          id: p.id || (p as any)._id?.toString(),
          title: p.title,
          slug: p.slug,
          stock: p.stock,
          price: p.price,
          category: p.category,
        });
      }
    }

    const totalOrders = financialStats.totalOrders;
    const totalRevenue = financialStats.totalRevenue;
    const paidOrdersCount = financialStats.paidOrdersCount;
    const averageOrderValue = financialStats.averageOrderValue || 0;

    return {
      financial: {
        totalRevenue,
        paidOrdersCount,
        pendingOrdersCount: financialStats.pendingOrdersCount,
        averageOrderValue,
      },
      orders: {
        totalOrders,
        paidOrdersCount,
        pendingOrdersCount: financialStats.pendingOrdersCount,
      },
      inventory: {
        totalProducts,
        totalUnitsInStock,
        inventoryValuation,
        lowStockCount,
        outOfStockCount,
        lowStockAlerts,
      },
      customers: {
        totalCustomers: usersPaginated.total,
      },
      recentOrders: ordersPaginated.data,
    };
  }
}
