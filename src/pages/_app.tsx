/*Esse arquivo _App fica por volta de tudo na aplicacao e e' renderizado sempre que a pagina muda*/

import { AppProps } from 'next/app';
import { Header } from '../components/Header';
import { Provider as NextAuthProvider} from "next-auth/client"; //Contexto do session, para ter acesso as credenciais do usuario

import "../styles/global.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvider>
  )
}

export default MyApp
