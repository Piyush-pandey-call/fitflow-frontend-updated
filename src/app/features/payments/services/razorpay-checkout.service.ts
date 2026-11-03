import { Injectable } from '@angular/core';
import { RazorpayCheckoutOrder } from '../../../models/payment.model';

/** What Razorpay's checkout.js passes to the success handler. */
export interface RazorpayCheckoutResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/**
 * Wraps Razorpay's Checkout widget (https://checkout.razorpay.com/v1/checkout.js).
 * This is a client-side popup SDK, not a REST API - Razorpay doesn't offer a
 * JSON endpoint for it, so loading their script tag and instantiating
 * `window.Razorpay` is the documented integration pattern. The script is
 * fetched once and cached; every subsequent call to `open()` reuses it.
 */
@Injectable({ providedIn: 'root' })
export class RazorpayCheckoutService {
  private scriptLoadPromise: Promise<void> | null = null;

  private loadScript(): Promise<void> {
    if (this.scriptLoadPromise) return this.scriptLoadPromise;

    this.scriptLoadPromise = new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load the Razorpay checkout script. Check your connection.'));
      document.body.appendChild(script);
    });

    return this.scriptLoadPromise;
  }

  /**
   * Opens Razorpay Checkout for an order created by the backend. Resolves
   * with the provider callback data; the caller must send it to the matching
   * backend verification endpoint before treating the payment as successful.
   */
  async open(
    order: RazorpayCheckoutOrder,
    customerName: string,
    options: { upiOnly?: boolean; description?: string; email?: string } = {}
  ): Promise<RazorpayCheckoutResult> {
    await this.loadScript();

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: 'FitFlow',
        description: options.description ?? 'Membership payment',
        prefill: { name: customerName, email: options.email },
        ...(options.upiOnly ? { method: { upi: true } } : {}),
        theme: { color: '#4f46e5' },
        handler: (result: RazorpayCheckoutResult) => resolve(result),
        modal: {
          ondismiss: () => reject(new Error('Payment window closed before completing payment.')),
        },
      });
      rzp.open();
    });
  }
}
