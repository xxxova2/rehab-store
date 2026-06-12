/**
 * WhatsApp Business API Integration for Rehab Store
 * Free tier: https://developers.facebook.com/docs/whatsapp/api
 */

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion: string;
}

interface OrderMessage {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  currency: string;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const WHATSAPP_API_URL = 'https://graph.facebook.com';

export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v18.0',
  };
}

export function formatOrderMessage(order: OrderMessage): string {
  const itemsList = order.items
    .map(item => `• ${item.name} x${item.quantity} - ${order.currency} ${(item.price / 100).toFixed(2)}`)
    .join('\n');

  return `🛍️ *New Order #${order.orderId}*

*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone}

*Items:*
${itemsList}

*Total:* ${order.currency} ${(order.totalAmount / 100).toFixed(2)}

Thank you for your order! 🙏`;
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<WhatsAppResponse> {
  const config = getWhatsAppConfig();

  if (!config.phoneNumberId || !config.accessToken) {
    console.error('WhatsApp API credentials not configured');
    return {
      success: false,
      error: 'WhatsApp API credentials not configured',
    };
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${config.apiVersion}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.messages) {
      return {
        success: true,
        messageId: data.messages[0].id,
      };
    } else {
      console.error('WhatsApp API error:', data);
      return {
        success: false,
        error: data.error?.message || 'Unknown error',
      };
    }
  } catch (error) {
    console.error('WhatsApp API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed',
    };
  }
}

export async function sendOrderNotification(
  order: OrderMessage
): Promise<WhatsAppResponse> {
  const message = formatOrderMessage(order);
  return sendWhatsAppMessage(order.customerPhone, message);
}

export async function createOrder(
  orderData: Omit<OrderMessage, 'orderId'>
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const orderId = `ORD-${Date.now()}`;
    const message = formatOrderMessage({
      ...orderData,
      orderId,
    });

    const whatsappResult = await sendWhatsAppMessage(
      orderData.customerPhone,
      message
    );

    if (whatsappResult.success) {
      return {
        success: true,
        orderId,
      };
    } else {
      return {
        success: false,
        error: whatsappResult.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Order creation failed',
    };
  }
}