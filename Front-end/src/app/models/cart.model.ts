export type CartItem = {
  product: {
    _id: string;
    title: string;
    price: number;
    image?: string;
  };
  quantity: number;
};

export type Cart = {
  _id: string;
  user: string;
  products: CartItem[];
};
