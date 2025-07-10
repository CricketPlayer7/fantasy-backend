declare module 'razorpay' {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface OrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    payment_capture?: 0 | 1;
    notes?: Record<string, any>;
  }

  interface Order {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, any>;
    created_at: number;
    [key: string]: any;
  }

  interface OrdersInterface {
    create(options: OrderOptions): Promise<Order>;
    fetch(orderId: string): Promise<Order>;
    all(options?: Record<string, any>): Promise<{ items: Order[] }>;
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    orders: OrdersInterface;
  }

  export default Razorpay;
}