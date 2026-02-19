'use server';

import { REVOLUT_API_URL, REVOLUT_API_VERSION, getRevolutConfig, sanitizeOrderReference, detectFraudulentActivity } from '@/lib/revolut';
import { CreateOrderRequest, CreateOrderResponse, RevolutErrorResponse } from '@/types/revolut';
import { headers } from 'next/headers';

export async function createRevolutOrder(
  request: CreateOrderRequest,
  userId?: string
): Promise<{ data?: CreateOrderResponse; error?: RevolutErrorResponse }> {
  try {
    const config = getRevolutConfig();
    
    if (!config.secretKey || !config.publicKey) {
      throw new Error('Missing Revolut API keys in environment');
    }

    // Get client IP for fraud detection
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');

    // Fraud detection
    if (userId && request.amount > 0) {
      const fraudCheck = detectFraudulentActivity(userId, request.amount, ipAddress);
      if (fraudCheck.isFraudulent) {
        return {
          error: {
            code: 'FRAUD_DETECTED',
            message: fraudCheck.reason || 'Suspicious activity detected',
          }
        };
      }
    }

    // Sanitize order reference
    const sanitizedRef = sanitizeOrderReference(request.merchantOrderExtRef);

    const body = {
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      merchant_order_ext_ref: sanitizedRef,
      ...(request.customerId && { customer_id: request.customerId }),
      ...(request.savePaymentMethod && { 
        customer_notification: {
          channel: 'email',
        },
        save_payment_method: true,
      }),
      ...(request.lineItems && {
        line_items: request.lineItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_amount: item.unitAmount,
        })),
      }),
    };

    const response = await fetch(`${REVOLUT_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
        'Revolut-Api-Version': REVOLUT_API_VERSION,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Revolut API error:', data);
      return { 
        error: {
          code: data.code || 'API_ERROR',
          message: data.message || 'Failed to create order',
        }
      };
    }

    return {
      data: {
        token: data.token || data.public_id,
        orderId: data.id,
        publicId: data.public_id,
        status: data.state,
        amount: data.amount,
        currency: data.currency,
      }
    };
  } catch (error) {
    console.error('Create order error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    };
  }
}

export async function retrieveRevolutOrder(orderId: string) {
  try {
    const config = getRevolutConfig();

    const response = await fetch(`${REVOLUT_API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Revolut-Api-Version': REVOLUT_API_VERSION,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data };
    }

    return { 
      data: {
        orderId: data.id,
        status: data.state,
        amount: data.amount,
        currency: data.currency,
        merchantOrderExtRef: data.merchant_order_ext_ref,
        payments: data.payments,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    };
  } catch (error) {
    console.error('Retrieve order error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    };
  }
}

export async function cancelRevolutOrder(orderId: string) {
  try {
    const config = getRevolutConfig();

    const response = await fetch(`${REVOLUT_API_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Revolut-Api-Version': REVOLUT_API_VERSION,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data };
    }

    return { data };
  } catch (error) {
    console.error('Cancel order error:', error);
    return {
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    };
  }
}
