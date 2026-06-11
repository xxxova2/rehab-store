export interface SkuRow {
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  inventoryItemId: string | null;
  thumbnail?: string | null;  stocked: number;
  reserved: number;
  reorderAt: number;
}

export interface LowStockAlert {
  productId: string;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  available: number;
  reorderAt: number;
}

export interface ActionResult<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface ProductImage {
  id: string;
  url: string;
}

export interface UploadedImage {
  url: string;
  key: string;
}

export interface PriceUpdate {
  productId: string;
  variantId: string;
  priceId?: string;
  amount: number;
  currencyCode: string;
}

export interface PriceListRow {
  id: string;
  name: string;
  description?: string;
  type: 'sale' | 'override';
  status?: string;
  prices: Array<{
    id: string;
    variant_id: string;
    currency_code: string;
    amount: number;
  }>;
}

export interface ProductPriceRow {
  productId: string;
  productTitle: string;
  variantId: string;
  basePriceAedCents: number;
  basePriceId: string | null;
  salePriceAedCents: number | null;
  salePriceId: string | null;
  onSale: boolean;
}

export type DiscountRuleType = 'percentage' | 'fixed' | 'free_shipping';

export interface DiscountRow {
  id: string;
  code: string;
  ruleType: DiscountRuleType;
  ruleValue: number;
  minCartAmount: number;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string;
  endsAt: string | null;
  isDisabled: boolean;
  isExpired: boolean;
}

export interface DiscountRule {
  id: string;
  type: DiscountRuleType;
  value: number;
  allocation?: string;
  conditions?: Array<{
    type: string;
    operator?: string;
    values?: string[];
  }>;
}

export interface Discount {
  id: string;
  code: string;
  rule_id: string;
  rule?: DiscountRule;
  usage_limit: number | null;
  usage_count: number;
  starts_at: string;
  ends_at: string | null;
  is_disabled: boolean;
  is_dynamic: boolean;
  metadata?: {
    min_cart_amount?: string | number;
  };
}

export const FX_RATES: Record<string, number> = {
  aed: 1,
  sar: 0.993,
  kwd: 0.083,
  egp: 13.12,
  usd: 0.272,
};

export type CurrencyCode = 'aed' | 'sar' | 'kwd' | 'egp' | 'usd';

export const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  'aed',
  'sar',
  'kwd',
  'egp',
  'usd',
];

export type PaymentStatus =
  | 'awaiting'
  | 'captured'
  | 'refunded'
  | 'canceled'
  | 'not_paid'
  | 'partially_refunded';

export type FulfillmentStatus =
  | 'not_fulfilled'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'canceled'
  | 'partially_fulfilled'
  | 'partially_shipped'
  | 'partially_returned'
  | 'returned'
  | 'requires_action';

export type AdminOrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'completed';

export interface Address {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string | null;
  quantity: number;
  unit_price: number;
  total?: number;
  variant_id?: string;
  variant?: {
    id: string;
    title: string;
    product?: {
      id: string;
      title: string;
      thumbnail?: string | null;
    };
  };
}

export interface Fulfillment {
  id: string;
  status: string;
  tracking_numbers?: string[];
  metadata?: {
    carrier?: string;
  };
  items?: Array<{
    item_id: string;
    quantity: number;
  }>;
  created_at: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

export interface Payment {
  id: string;
  provider_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  captured_at?: string | null;
}

export interface AdminNote {
  text: string;
  author: string;
  createdAt: string;
}

export interface MedusaOrder {
  id: string;
  display_id: number;
  status: string;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  customer_id?: string;
  customer?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  total: number;
  subtotal: number;
  shipping_total?: number;
  discount_total?: number;
  tax_total?: number | null;
  item_total?: number;
  currency_code: string;
  items: OrderItem[];
  fulfillments?: Fulfillment[];
  payments?: Payment[];
  shipping_address?: Address;
  billing_address?: Address;
  shipping_methods?: Array<{
    id: string;
    name?: string;
    amount: number;
    price?: number;
  }>;
  discounts?: Array<{
    id: string;
    code: string;
    amount: number;
  }>;
  metadata?: {
    admin_status?: string;
    admin_notes?: AdminNote[];
  };
  created_at: string;
  updated_at?: string;
}

export interface MedusaCollection {
  id: string;
  title: string;
  handle?: string;
  metadata?: {
    title_ar?: string;
    description_ar?: string;
  };
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  products?: Array<{ id: string }>;
}

export interface MedusaAdminUser {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: 'admin' | 'member' | 'developer';
  created_at: string;
  updated_at?: string;
}

export interface MedusaCustomer {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  billing_address?: Address | null;
  shipping_addresses?: Address[];
  orders?: Array<{
    id: string;
    display_id: number;
    status: string;
    total: number;
    created_at: string;
  }>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  defaultCurrency: string;
  defaultLocale: 'ar' | 'en';
  socialInstagram?: string;
  socialTikTok?: string;
  shippingFreeAed: number;
}
