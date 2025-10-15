// src/services/products.ts
import { http } from '../services/http'; // ⬅️ ajusta si tu http vive en otra ruta

export type Product = {
  product_id: number;
  name: string;
  sku?: string;
  sale_price?: number;
  image_url?: string;
  stock?: number;
  categories?: { id: number; name: string } | { name: string };
  brands?: { id: number; name: string } | { name: string };
  description?: string;
  barcode?: string;
  category_id?: number;
  brand_id?: number;
  unit_id?: number;
};

export type ProductPayload = {
  sku: string;
  name: string;
  categoryId?: number;
  brandId?: number;
  unitId: number;
  barcode?: string;
  description?: string;
  costPrice: number;
  salePrice: number;
  isTaxable: boolean;
  minStock: number;
};

export type ProductsResponse = {
  data: Product[];
  meta: { page: number; pageSize: number; total: number };
};

export async function getProducts(params: {
  search?: string;
  categoryId?: number;
  brandId?: number;
  page?: number;
  pageSize?: number;
}): Promise<ProductsResponse> {
  const res = await http.get('/catalog/products', { params });
  const lvl1 = res?.data ?? {};
  const rows = Array.isArray(lvl1.data) ? lvl1.data : (Array.isArray(lvl1.items) ? lvl1.items : []);
  const meta = lvl1.meta ?? { page: params.page ?? 1, pageSize: params.pageSize ?? 20, total: rows.length };
  return { data: rows, meta };
}

export async function getProduct(id: number) {
  const res = await http.get(`/catalog/products/${id}`);
  return res.data as Product & { cost_price?: number; is_taxable?: boolean; min_stock?: number };
}

export async function getCategories() {
  const { data } = await http.get<{ data: Array<{ category_id: number; name: string }> }>(
    '/catalog/categories',
    { params: { page: 1, pageSize: 100 } }
  );
  return data.data.map((c) => ({ id: c.category_id, name: c.name }));
}

export async function getBrands() {
  const { data } = await http.get<{ data: Array<{ brand_id: number; name: string }> }>(
    '/catalog/brands',
    { params: { page: 1, pageSize: 100 } }
  );
  return data.data.map((b) => ({ id: b.brand_id, name: b.name }));
}

export async function getUnits() {
  const { data } = await http.get('/catalog/units', { params: { pageSize: 500 } });
  return (data?.data || []).map((u: any) => ({ id: u.unit_id, code: u.code, name: u.name })) as Array<{ id: number; code: string; name: string }>;
}

export async function createProduct(payload: ProductPayload) {
  const body = {
    sku: payload.sku,
    name: payload.name,
    categoryId: payload.categoryId ?? undefined,
    brandId: payload.brandId ?? undefined,
    unitId: payload.unitId,
    barcode: payload.barcode ?? undefined,
    description: payload.description ?? undefined,
    costPrice: payload.costPrice,
    salePrice: payload.salePrice,
    isTaxable: payload.isTaxable,
    minStock: payload.minStock,
  };
  const { data } = await http.post('/catalog/products', body);
  return data;
}

export async function updateProduct(id: number, payload: ProductPayload) {
  const body = {
    sku: payload.sku,
    name: payload.name,
    categoryId: payload.categoryId ?? undefined,
    brandId: payload.brandId ?? undefined,
    unitId: payload.unitId,
    barcode: payload.barcode ?? undefined,
    description: payload.description ?? undefined,
    costPrice: payload.costPrice,
    salePrice: payload.salePrice,
    isTaxable: payload.isTaxable,
    minStock: payload.minStock,
  };
  const { data } = await http.put(`/catalog/products/${id}`, body);
  return data;
}

export async function deleteProduct(id: number) {
  const { data } = await http.delete(`/catalog/products/${id}`);
  return data;
}

/** ====== IMAGEN (RN) ======
 * file debe ser { uri: string; name?: string; type?: string }
 * name: por ejemplo 'image.jpg', type: 'image/jpeg'
 */
export async function uploadProductImage(productId: number, file: { uri: string; name?: string; type?: string }) {
  const fd = new FormData();
  fd.append('file', {
    // @ts-ignore FormData RN
    uri: file.uri,
    name: file.name || 'image.jpg',
    type: file.type || 'image/jpeg',
  });
  const { data } = await http.post<{ image_url: string }>(`/catalog/products/${productId}/image`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.image_url;
}

export async function clearProductImage(productId: number) {
  await http.delete(`/catalog/products/${productId}/image`);
}
