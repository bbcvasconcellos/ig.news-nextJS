import { /* GetServerSideProps */ GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./home.module.scss";

interface HomeProps {
  product: {
    priceId: string,
    amount: number
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
    <Head>
      <title>Home | ig.news</title>
    </Head>
    <main className={styles.contentContainer}>
      <section className={styles.hero}>
        <span>👏 Hey, Welcome!</span>
        <h1>News about the <span>React</span> world.</h1>
        <p>
          Get access to all the publications <br />
          <span> for {product.amount} month </span>
        </p>
        <SubscribeButton priceId={product.priceId}/>
      </section>
      <img src="/images/avatar.svg" alt="girl coding" />
    </main>
    </>
  )
}

/*essa funcao e' executada no servidor node do nextjs
  em ssr -> getServerSideProps: GetServerSideProps
*/
export const getStaticProps: GetStaticProps = async() => {
  const price = await stripe.prices.retrieve('price_1JhO66E7QcdsnE5tkmEV54xa')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount / 100), //valor em centavos
  }

  return {
    props: {
      product,
    },
    //tempo em segundos que a pagina vai ser revalidada (gera um novo html)
    revalidate: 60 * 60 * 24, //24 horas
  }
}

/*SSG x SSR
SSG = Static Side Generator: 
util para paginas estaticas quais as informacoes
sao globais ou seja a pagina tras as mesmas informacoes para qualquer usuario,
constroi um html a cada x segundos atraves da funcao revalidate,

SSR = Server Side Rendering:
util para paginas dinamicas, que trazem paginas com informacoes individuais para
cada usuario. Ex: uma pagina que traz uma mensagem customizada em tela como
`Bom dia ${name}`

Client Side: util para pegar dados da api
*/