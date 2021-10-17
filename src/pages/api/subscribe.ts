import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client"; //pega os dados do usuario
import { query } from "faunadb";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  }
  data: {
    stripe_customer_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //verifica se o metodo da req e' post, pois esta CRIANDO uma checkout session
  if(req.method === "POST") {
    const session = await getSession({ req });

    const user = await fauna.query<User>(
      query.Get(
        query.Match(
          query.Index('user_by_email'),
          query.Casefold(session.user.email)
        )
      )
    )
    
    //cria uma variavel para pegar o id do usuario do stripe
    let customerId = user.data.stripe_customer_id

    //se o usuario nao tiver um id registrado na stripe, cria um novo
    if(!customerId){
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
      })
      
      //utiliza as query do fauna para checar o id do usario e evitar qualquer duplicacao
      await fauna.query(
        query.Update(
          query.Ref(query.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )
      customerId = stripeCustomer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId, //id do cliente no stripe
      payment_method_types: ['card'],
      billing_address_collection: 'required', //requer o endereco da pessoa
      line_items: [
        { price: 'price_1JhO66E7QcdsnE5tkmEV54xa', quantity: 1}
      ],
      mode: 'subscription',
      allow_promotion_codes: true, //criacao de coupons de disconto
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })
    return res.status(200).json({ sessionId: checkoutSession.id })
  }
  else {
    res.setHeader("Allow", "POST"); //essa rota aceita somente req http do tipo POST
    res.status(405).end("Method not allowed");
  }
}