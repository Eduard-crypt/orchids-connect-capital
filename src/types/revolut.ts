// Order states
export type OrderState = 
  | 'PENDING'
  | 'AUTHORISED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'FAILED'
  | 'CANCELLED';

// Payment method types
export type PaymentMethodType = 'card' | 'revolut_pay';

// Webhook events
export type WebhookEvent = 
  | 'ORDER_COMPLETED'
  | 'ORDER_AUTHORISED'
  | 'ORDER_DECLINED'
  | 'ORDER_FAILED';

// Order object
export interface RevolutOrder {
  id: string;
  state: OrderState;
  amount: number;
  currency: string;
  description?: string;
  merchant_order_ext_ref: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
  payments?: Payment[];
}

// Payment object
export interface Payment {
  id: string;
  state: 'AUTHORISED' | 'CAPTURED' | 'DECLINED' | 'FAILED';
  amount: number;
  currency: string;
  method: PaymentMethodType;
  created_at: string;
}

// Error response
export interface RevolutErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Successful response
export interface RevolutSuccessResponse<T> {
  data: T;
  error?: never;
}

// API response wrapper
export type RevolutResponse<T> = 
  | RevolutSuccessResponse<T>
  | { data?: undefined; error: RevolutErrorResponse };

// Widget events
export interface WidgetSuccessEvent {
  status: 'SUCCESS' | 'SUCCESS_NEED_3DS' | 'PENDING';
  orderToken?: string;
}

export interface WidgetErrorEvent {
  status: 'GENERAL_ERROR' | 'CARD_DECLINED' | 'AUTHENTICATION_FAILED';
  message: string;
  code?: string;
}

// Create order request
export interface CreateOrderRequest {
  amount: number; // in smallest currency unit (cents)
  currency: string; // e.g., 'USD', 'GBP', 'EUR'
  description: string;
  customerId?: string;
  merchantOrderExtRef: string; // idempotency key / order reference
  savePaymentMethod?: boolean;
  lineItems?: Array<{
    name: string;
    quantity: number;
    unitAmount: number;
  }>;
}

// Create order response
export interface CreateOrderResponse {
  token: string;
  orderId: string;
  publicId?: string;
  status: string;
  amount: number;
  currency: string;
}
