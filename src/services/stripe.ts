import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey || !stripePublicKey.startsWith('pk_')) {
  console.error('Invalid or missing Stripe public key. Please ensure VITE_STRIPE_PUBLIC_KEY is set correctly and starts with pk_');
}

let stripePromise: Promise<any> | null = null;
let isProcessing = false;

export const getStripe = () => {
  if (!stripePromise) {
    if (!stripePublicKey) {
      throw new Error('Missing Stripe public key. Please add VITE_STRIPE_PUBLIC_KEY to your environment variables.');
    }
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

export const createCheckoutSession = async (priceId: string) => {
  // Prevent multiple concurrent calls
  if (isProcessing) {
    throw new Error('Payment is already in progress');
  }

  if (!priceId) {
    throw new Error('Invalid price ID');
  }

  try {
    isProcessing = true;
    const stripe = await Promise.race([
      getStripe(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stripe initialization timed out')), 30000)
      )
    ]);
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const checkoutPromise = stripe.redirectToCheckout({
      lineItems: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: priceId.includes('subscription') ? 'subscription' : 'payment',
      successUrl: `${window.location.origin}/upload?session_id={CHECKOUT_SESSION_ID}&source=payment`,
      cancelUrl: `${window.location.origin}/?payment=cancelled`,
    });

    const result = await Promise.race([
      checkoutPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Checkout session creation timed out')), 30000)
      )
    ]);

    if (result?.error) {
      console.error('Stripe checkout error:', result.error);
      throw result.error;
    }
  } catch (err) {
    console.error('Payment error:', err);
    if (err instanceof Error) {
      // Handle specific timeout errors
      if (err.message.includes('timed out')) {
        throw new Error('Payment process timed out. Please try again. If this persists, check your internet connection.');
      }
      throw new Error(`Payment failed: ${err.message}`);
    }
    throw new Error('Payment failed. Please try again.');
  } finally {
    isProcessing = false;
  }
};