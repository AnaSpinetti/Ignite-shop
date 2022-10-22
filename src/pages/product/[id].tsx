import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useState } from "react";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product";

interface ProductProps{
    product: {
        id: string,
        name: string,
        imageURL: string,
        price: string,
        description: string,
        defaultPriceId: string
    }
}

export default function Product({product}: ProductProps){
    const [ isCreatingCheckoutSession, setIsCreatingCheckoutSession ] = useState(false);

    async function handleBuyProduct() {
        setIsCreatingCheckoutSession(true)

        try {
            const response =  await axios.post('/api/checkout', {
                priceId: product.defaultPriceId,
            })

            const {checkoutUrl} = response.data;
            
            window.location.href = checkoutUrl;

        } catch (error) {
            setIsCreatingCheckoutSession(false);
            console.log(error)
            alert('Falha ao redirecionar para o checkout')
        }
    }

    return(
        <ProductContainer>
            <ImageContainer>
                <Image src={product.imageURL} alt="" width={520} height={480} />
            </ImageContainer>

            <ProductDetails>
                <h1>{product.name}</h1>
                <span>{product.price}</span>

                <p>{product.description}</p>

                <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>Comprar agora</button>
            </ProductDetails>
        </ProductContainer>

    )
}

export const getStaticPaths: GetStaticPaths = async() => {
    return{
        paths: [
            {params: {id: ''}}
        ],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {

    const productId = String(params.id);
    const produto = await stripe.products.retrieve(productId, {
        expand: ['default_price']
    })

        const price = produto.default_price as Stripe.Price

    return {
        props: {
            product: {
                id: produto.id,
                name: produto.name,
                imageURL: produto.images[0],
                price: new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(price.unit_amount / 100),
                description: produto.description,
                defaultPriceId: price.id
            }
        },
        revalidate: 60*60*1
    }
}