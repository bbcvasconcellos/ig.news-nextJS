//rota do webhook -> recebe eventos redirecionados do stripe
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe"
import { saveSubscription } from "./_lib/manageSubscription";


async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable){
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    );
  }
  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false //dasabilita o entendimento padrao do next de ler a req como um json
  }
}

//obs Set -> tipo um array, porem sem duplicacoes
const relevantEvents = new Set([
  //eventos que estao sendo ouvido do stripe webhook
  'checkout.session.completed', 
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //verifica se o metodo e' post
  if(req.method === "POST"){
    const buf = await buffer(req);
    const secret = req.headers["stripe-signature"];

    let event: Stripe.Event;

    //valida atraves de uma key se e' a propria aplicacao que esta criando uma nova requisicao e nao alguem externo
    try{
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
    } 
    catch (err){
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event; //valor recebido dentro do terminal

    if(relevantEvents.has(type)){
      try {
        switch(type){
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':

            const subscription = event.data.object as Stripe.Subscription;
            
            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            )

          break;


          case 'checkout.session.completed' :
          
            const checkoutSession = event.data.object as Stripe.Checkout.Session;
          
            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )

            break;
          //caso seja algum evento relevante, mas que tenha sido esquecido de receber tratamento no switch
          default:
            throw new Error("unhandled event")
        }
      }
      catch(err){
        return res.json({ error: "webhook handler failed" })
      }  
    }

    res.json({ received: true })
  }
  
  else{
    //somente aceita method post
    res.setHeader("Allow", "POST");
    //retorna erro para o cliente
    res.status(405).end("Method not allowed");
  }
   
}