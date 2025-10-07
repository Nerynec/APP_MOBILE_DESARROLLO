export type Product = { id: string; name: string; price: number; image?: string };

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Tornillo 1/4" x 20', price: 0.5, image: 'https://picsum.photos/200?random=1' },
  { id: 'p2', name: 'Destornillador Phillips', price: 7.5, image: 'https://picsum.photos/200?random=2' },
  { id: 'p3', name: 'Taladro 500W', price: 120, image: 'https://picsum.photos/200?random=3' },
  { id: 'p4', name: 'Cinta aislante (1 rollo)', price: 2.75, image: 'https://picsum.photos/200?random=4' },
];
