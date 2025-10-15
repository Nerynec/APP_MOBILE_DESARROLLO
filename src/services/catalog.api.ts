// src/services/catalog.api.ts
import { http } from './http';

export type GetProductsParams = {
  search?: string;
  page?: number;      // 1-based
  pageSize?: number;  // por ej. 20
  categoryId?: number;
  brandId?: number;
};

export type ApiProduct = {
  product_id: number;
  sku: string;
  name: string;
  category_id: number;
  brand_id: number;
  unit_id: number;
  barcode: string | null;
  description: string | null;
  cost_price: string;   // viene como string
  sale_price: string;   // viene como string
  is_taxable: boolean;
  min_stock: string | null;
  created_at: string;
  image_url: string | null;
  categories?: { category_id: number; name: string; description?: string | null };
  brands?: { brand_id: number; name: string };
  units?: { unit_id: number; code: string; name: string };
};

export type GetProductsResponse = {
  data: ApiProduct[];
  page?: number;
  pageSize?: number;
  total?: number;
};

export async function getProducts(params: GetProductsParams): Promise<GetProductsResponse> {
  const res = await http.get<GetProductsResponse>('/catalog/products', { params });
  return res.data;
}
