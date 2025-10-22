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

// 👇 Nuevo: modelo para el carrito (simple y estable en toda la app)
export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image?: string; // URL opcional
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

// 👇 Nuevo: conversor UiProduct -> CartProduct
export function toCartProduct(p: UiProduct): CartProduct {
  return {
    id: String(p.id),
    name: String(p.name),
    price: Number.isFinite(Number(p.price)) ? Number(p.price) : 0,
    image: p.imageUrl || undefined,
  };
}
