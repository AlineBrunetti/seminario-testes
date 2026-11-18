export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Order {
  id: string;
  customerName: string;
  productId: string;
  quantity: number;
  total: number;
}

const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Teclado Mecânico Brown', price: 250, stock: 15 },
  { id: 'prod-2', name: 'Monitor Ultrawide 29"', price: 1200, stock: 5 }
];

let products: Product[] = initialProducts.map((product) => ({ ...product }));
let orders: Order[] = [];

export const db = {
  getProducts: () => products,
  getProductById: (id: string) => products.find((product) => product.id === id),
  updateStock: (id: string, quantityUsed: number) => {
    const product = products.find((item) => item.id === id);
    if (product) {
      product.stock -= quantityUsed;
    }
  },
  createOrder: (order: Omit<Order, 'id'>): Order => {
    const newOrder = { ...order, id: `ord-${orders.length + 1}` };
    orders.push(newOrder);
    return newOrder;
  },
  getOrders: () => orders,
  reset: () => {
    products = initialProducts.map((product) => ({ ...product }));
    orders = [];
  }
};
