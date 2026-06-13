import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, ordersTable } from '@/lib/supabase';
import type { OrderItem } from '@/lib/db-types';
import { sendOrderNotification, formatOrderMessage } from '@/lib/whatsapp';

interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: OrderItem[];
  total_amount: number;
  currency?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.customer_phone || !body.items || body.total_amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, customer_phone, items, total_amount' },
        { status: 400 }
      );
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items must be a non-empty array' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order in Supabase
    const { data: order, error: orderError } = await ordersTable(supabase)
      .insert({
        order_number: orderNumber,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email,
        items: body.items,
        total_amount: body.total_amount,
        currency: body.currency || 'AED',
        status: 'pending',
        notes: body.notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Send WhatsApp notification
    const whatsappMessage = formatOrderMessage({
      orderId: orderNumber,
      customerName: body.customer_name,
      customerPhone: body.customer_phone,
      items: body.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: body.total_amount,
      currency: body.currency || 'AED',
    });

    const whatsappResult = await sendOrderNotification({
      orderId: orderNumber,
      customerName: body.customer_name,
      customerPhone: body.customer_phone,
      items: body.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: body.total_amount,
      currency: body.currency || 'AED',
    });

    // Update order with WhatsApp status
    if (whatsappResult.success) {
      await ordersTable(supabase)
        .update({
          whatsapp_sent: true,
          whatsapp_sent_at: new Date().toISOString(),
        })
        .eq('id', order.id);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        status: order.status,
        total_amount: order.total_amount,
        currency: order.currency,
        whatsapp_sent: whatsappResult.success,
      },
      whatsapp: {
        message_id: whatsappResult.messageId,
        error: whatsappResult.error,
      },
    });

  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}