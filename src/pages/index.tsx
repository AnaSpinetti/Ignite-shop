import { GetStaticProps } from "next";
import Head from "next/head";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import Image from "next/image";

import { useKeenSlider } from "keen-slider/react";
import 'keen-slider/keen-slider.min.css';

import { HomeContainer, Product } from "../styles/pages/home";
import Link from "next/link";


interface HomeProps {
  products: {
    id: string,
    name: string,
    imageURL: string,
    price: string
  }[]
}

export default function Home({ products }: HomeProps) {
  const [sliderRef] = useKeenSlider({
    slides: ({
      perView: 3,
      spacing: 48
    })
  })

  return (
    <>
      <Head>
        <title>Ignite Shop</title>
      </Head>
      <HomeContainer ref={sliderRef} className='keen-slider'>
        {products.map(produto => {
          return (
            <Link href={`/product/${produto.id}`} key={produto.id} prefetch={false}>
              <Product className="keen-slider__slide">
                <Image src={produto.imageURL} width={520} height={480} alt="" />
                <footer>
                  <strong>{produto.name}</strong>
                  <span>{'R$ ' + produto.price}</span>
                </footer>
              </Product>
            </Link>
          )
        })}

      </HomeContainer>
    </>
  )
}

//Renderização no server, antes do carregamento da página
// export const getServerSideProps: GetServerSideProps = async () => {
//   const response = await stripe.products.list({ expand: ['data.default_price'] });
//   const products = response.data.map(produto => {
//     const price = produto.default_price as Stripe.Price
//     return {
//       id: produto.id,
//       name: produto.name,
//       imageURL: produto.images[0],
//       price: price.unit_amount / 100 + ',00'
//     }
//   })

//   return {
//     props: {
//       products
//     }
//   }
// }

//Renderização utilizando cache que a página já possui, indicado quando a página não tem muitas mudanças
export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({ expand: ['data.default_price'] });
  const products = response.data.map(produto => {
    const price = produto.default_price as Stripe.Price
    return {
      id: produto.id,
      name: produto.name,
      imageURL: produto.images[0],
      price: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(price.unit_amount / 100)
    }
  })

  return {
    props: {
      products
    },
    //verificando se a página estática teve atualizações
    revalidate: 60 * 60 * 2
  }
}