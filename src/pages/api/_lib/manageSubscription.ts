import { query } from "faunadb";

import { fauna } from "../../../services/fauna";
import { stripe } from "../../../services/stripe";

//essa funcao salva informacoes no banco de daods
export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  const userRef = await fauna.query(
    query.Select(
      "ref",
      query.Get(
        query.Match(
          query.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  )

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  }

  //cria uma nova subscription
  if(createAction){
    await fauna.query(
      query.Create(
        query.Collection('subscriptions'),
        { data: subscriptionData}
      )
    )
  }
  //senao atualiza dados do usuario
  else {
    await fauna.query(
      query.Replace(
        query.Select(
          "ref", 
          query.Get(
            query.Match(
              query.Index("subscription_by_id"),
              subscriptionId
            )
          )
        ), {
          data: subscriptionData
        }
      )
    )
  }
}
    