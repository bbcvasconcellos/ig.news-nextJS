import { GetStaticProps } from 'next';
import Head  from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom'; //conversor do formato prismic para html

import styles from './styles.module.scss';

//type define os tipos dos elementos do array
type Post = {
  slug: string,
  title: string,
  excerpt: string,
  updateAt: string,
}

//o interface apenas define a tipagem do array declarado em post
interface PostProps {
  posts: Post[]
}

export default function Posts({ posts }: PostProps) {
  return(
    <>
      <Head>
        <title>Posts | Ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <a key={post.slug} href='#'>
              <time>{post.updateAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </a>
          ))}
        </div>
      </main>
    </>
  )
}

//essa pagina vai ser estatica? se sim vamos usar o getStaticServer, senao nao precisa usar
export const getStaticProps: GetStaticProps = async() => {
  const prismic = getPrismicClient()

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.content'],
    pageSize: 100,
  })
  //formata os dados da api para um codigo mais eficiente e rapido
  const posts = response.results.map(post => {
    return {
      slug: post.uid,//"url" do post
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  });

  return {
    props: {posts}
  }
}