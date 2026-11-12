import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getAllCategories(onlyActive = false): Promise<Category[]> {
    const filter = onlyActive ? { isActive: true } : {};
    return this.categoryModel.find(filter).sort({ sortOrder: 1, createdAt: 1 }).exec();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} یافت نشد.`);
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();
    const slug = dto.slug?.trim().toLowerCase() || this.generateSlug(name);

    // Check duplicate name or slug
    const existing = await this.categoryModel.findOne({
      $or: [{ name }, { slug }],
    }).exec();

    if (existing) {
      throw new ConflictException(`دسته‌بندی با این نام یا اسلاگ قبلاً ثبت شده است.`);
    }

    const created = new this.categoryModel({
      ...dto,
      name,
      slug,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return created.save();
  }

  async updateCategory(id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} یافت نشد.`);
    }

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryModel.findOne({ name: dto.name.trim() }).exec();
      if (existing) {
        throw new ConflictException(`دسته‌بندی با نام "${dto.name}" قبلاً وجود دارد.`);
      }
      category.name = dto.name.trim();
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existingSlug = await this.categoryModel.findOne({ slug: dto.slug.trim().toLowerCase() }).exec();
      if (existingSlug) {
        throw new ConflictException(`اسلاگ "${dto.slug}" قبلاً استفاده شده است.`);
      }
      category.slug = dto.slug.trim().toLowerCase();
    }

    if (dto.description !== undefined) category.description = dto.description;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.accentColor !== undefined) category.accentColor = dto.accentColor;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;

    return category.save();
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const res = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!res) {
      throw new NotFoundException(`دسته‌بندی با شناسه ${id} یافت نشد.`);
    }
    return { success: true, message: 'دسته‌بندی با موفقیت حذف شد.' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '') || `category-${Date.now()}`;
  }
}
