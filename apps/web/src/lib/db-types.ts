/**
 * Supabase Database type definitions for Rehab Store.
 * Derived from supabase-schema.sql — keep in sync when the schema changes.
 */

import type { Product, Collection } from '@rehab/types';

// ── Table row types ──────────────────────────────────────────────────

export interface ProductRow {
  id: string;
  slug: string;
  data: Product;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  id: string;
  slug: string;
  data: Product;
}

export interface ProductUpdate {
  slug?: string;
  data?: Product;
}

export interface CollectionRow {
  id: string;
  slug: string;
  data: Collection;
  created_at: string;
}

export interface CollectionInsert {
  id: string;
  slug: string;
  data: Collection;
}

export interface CollectionUpdate {
  slug?: string;
  data?: Collection;
}

export interface InventoryRow {
  product_id: string;
  stock: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface InventoryInsert {
  product_id: string;
  stock: Record<string, number>;
}

export interface InventoryUpdate {
  stock?: Record<string, number>;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: OrderStatus;
  notes: string | null;
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderInsert {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: OrderItem[];
  total_amount: number;
  currency?: string;
  status?: OrderStatus;
  notes?: string;
}

export interface OrderUpdate {
  whatsapp_sent?: boolean;
  whatsapp_sent_at?: string;
  status?: OrderStatus;
}

export type AdminUserRole = 'admin' | 'member' | 'developer';

export interface AdminUserRow {
  id: string;
  email: string;
  role: AdminUserRole;
  created_at: string;
  updated_at: string;
}

export interface AdminUserInsert {
  id: string;
  email: string;
  role?: AdminUserRole;
}

export interface AdminUserUpdate {
  role?: AdminUserRole;
}

export interface StoreSettingsData {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  defaultCurrency: string;
  defaultLocale: 'ar' | 'en';
  socialInstagram?: string;
  socialTikTok?: string;
  shippingFreeAed: number;
}

export interface StoreSettingsRow {
  id: string;
  data: StoreSettingsData;
  updated_at: string;
}

export interface StoreSettingsInsert {
  id?: string;
  data: StoreSettingsData;
}

export interface StoreSettingsUpdate {
  data?: StoreSettingsData;
}

// ── Database schema ──────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [];
      };
      collections: {
        Row: CollectionRow;
        Insert: CollectionInsert;
        Update: CollectionUpdate;
        Relationships: [];
      };
      inventory: {
        Row: InventoryRow;
        Insert: InventoryInsert;
        Update: InventoryUpdate;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: OrderUpdate;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: AdminUserInsert;
        Update: AdminUserUpdate;
        Relationships: [];
      };
      store_settings: {
        Row: StoreSettingsRow;
        Insert: StoreSettingsInsert;
        Update: StoreSettingsUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
