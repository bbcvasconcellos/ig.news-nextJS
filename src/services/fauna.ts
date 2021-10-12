import { Client } from "faunadb";

//configura o fauna e acesso ao banco de dados
export const fauna = new Client({
  secret: process.env.FAUNADB_KEY
})