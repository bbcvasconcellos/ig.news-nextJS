//usando stripe, nao precisa se preocupar com os metodos, estao todos definidos na documentacao
//configura o stripe
import Stripe from 'stripe';
import { version } from '../../package.json'

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY,
  {
    apiVersion: '2020-08-27',
    appInfo: {
      name: 'ignews',
      version: version
    }
  }
)

