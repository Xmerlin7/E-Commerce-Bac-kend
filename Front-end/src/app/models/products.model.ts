export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string | { _id: string; name?: string };
  image?: string;
  inStock: 'yes' | 'no';
}

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  inStock: 'yes' | 'no';
}
