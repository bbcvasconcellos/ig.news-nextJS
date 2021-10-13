import { loadStripe } from "@stripe/stripe-js";

export const getStripeJs = async() => {
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY); //o NEXT_PUBLIC sinaliza que e' uma chave publica

  return stripeJs;
}