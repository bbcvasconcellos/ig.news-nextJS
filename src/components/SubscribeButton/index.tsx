import { signIn, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe.js";
import styles from "./styles.module.scss";


interface SubscribeButtonProps {
  priceId: string
}

export const SubscribeButton = ({ priceId }: SubscribeButtonProps) => {
  const [session] = useSession();
  const router = useRouter() //usa o useRouter para redirecionar uma rota programada ao inves de ser por botao como no link

  const handleSubscribe = async () => {
    //se nao existir uma sessao, redirecione o usuario
    if (!session) {
      signIn('github')
      return;
    }

    if(session.activeSubscription) {
      router.push('/posts')
      return
    }

    try {
      const response = await api.post('/subscribe');

      const { sessionId }:any = response.data;      

      const stripe = await getStripeJs();

      await stripe.redirectToCheckout({ sessionId });
    } 
    catch (err) {
      alert(err.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now
    </button>
  );
}