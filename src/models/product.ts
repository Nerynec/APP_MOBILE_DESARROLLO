// src/models/product.ts
import { ApiProduct } from '../services/catalog.api';

export type UiProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  sku: string;
  brand?: string;
  category?: string;
};

export function mapApiToUi(p: ApiProduct): UiProduct {
  return {
    id: String(p.product_id),
    name: p.name,
    price: Number(p.sale_price ?? 0),
    imageUrl: p.image_url,
    sku: p.sku,
    brand: p.brands?.name,
    category: p.categories?.name,
  };
}
