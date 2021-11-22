import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head"
import { RichText } from "prismic-dom"
import { getPrismicClient } from "../../services/prismic"
import styles from "./post.module.scss"


interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updateAt: string;
  }
}

export default function Post({ post }: PostProps) {
  return(
    <>
      <Head>
        <title>{post.title} | Ig.news</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updateAt}</time>
          <div 
            dangerouslySetInnerHTML={{__html: post.content}}
            className={styles.postContent}  
          />
        </article>
      </main>
    </>
  )
}

//Conteudo estatico -> ssr para garantir que o usuario esteja logado para acessar o post 
export const getServerSideProps: GetServerSideProps = async({ req, params }) => {
  const session = await getSession({ req }) //informa se o usuario esta logado ou nao
  const { slug } = params;

  /* if(!session) {} */

  const prismic = getPrismicClient(req)
  const response = await prismic.getByUID('post', String(slug), {}) //slug vem no formato de array, para passar somente uma string fazemos um casting
  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post,
    }
  }


} 