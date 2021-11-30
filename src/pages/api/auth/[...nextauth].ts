import { query } from "faunadb";

import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { fauna } from "../../../services/fauna";

//autenticacao do usuario com github
export default NextAuth({
  // Configure one or more authentication providers
  /*cada provider pode ser um meio de fazer login na aplicacao usando
    alguma aplicacao de 3o como por exemplo github, facebook, google, etc
  */
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
  /*callbacks sao funcoes que executam uma acao sempre que sao acionadas, no caso abaixo a funcao 
    signin sera sempre executada quando o usuario se logar
  */
  callbacks: {
    //permite modificar os dados do contexto session
    async session(session) {
      session.user.email

     try { 
       const userActiveSubscription = await fauna.query(
        query.Get(
          query.Intersection([
            query.Match(
              query.Index('subscription_by_user_ref'),
              query.Select(
                'ref',
                query.Get(
                  query.Match(
                    query.Index('user_by_email'),
                    query.Casefold(session.user.email)
                  )
                )
              )
            ),
            query.Match(
              query.Index('subscription_by_status'),
              "active"
            )
          ])
        )
      )
      return {
        ...session,
        activeSubscription: userActiveSubscription
        }
      } 
      catch {
        return {
          ...session,
          activeSubscription: null
        }
      }
    },
    async signIn({ user, account, profile, email }) {
      //insercao/salvar user no banco de dado
      try{
        await fauna.query(
          //checa a existencia de um usuario com o email fornecido
          //se nao existe um usuario com o seguinte email... 
          query.If(
            query.Not(
              query.Exists(
                query.Match(
                  query.Index('user_by_email'),
                  query.Casefold(email) //caixa alta ou baixa indifere
                )
              )
            ),
            //se nao existe o email fornecido, cria um novo usuario
            query.Create(
              query.Collection('users'), //collection = nome da tabela a ser inserida
              { data: { email } }
            ),
            //se existe somente busque o usuario 
            query.Get(
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(email)
              )
            )
          )
        )
        return true //caso de sucesso de insercao de login no banco
      } catch {
        return false //login nao foi inserido
      }
    },
  }
})