import Layout from "@/components/Globals/Layout";
import ProductSlider from "@/components/Products/ProductSlider";
import { mongooseConnect } from "@/lib/mongoose";
import { Author } from "@/models/Author";
import { Product } from "@/models/Product";
import { WishedProduct } from "@/models/WishedProduct";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import BackButton from "@/components/Globals/BackButton";
import Image from "next/image";
import { useState,useEffect } from "react";
import { getImageAspectRatio } from "@/lib/utils";
import parse from 'html-react-parser';
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

export default function AuthorPage({author,sameAuthorProducts,wishedProducts}) {
  const tSingleAuthorPage = useTranslations('Authors.SingleAuthor');

  const [activeWidth,setActiveWidth] = useState(0);
  const {locale} = useRouter();

  useEffect(() => {
    getImageWidth(author.image);
  }, []);

  async function getImageWidth(image) {
    if (!image) return;
    let w = 0;
    const aspectRatio = await getImageAspectRatio(image);
    w = Math.floor(aspectRatio * 530);
    if (w > 530) w = 530;
    setActiveWidth(w);
  };
  return (
    <>
      <Layout>
        <BackButton />
        <div className="flex max-sm:flex-col sm:items-center gap-10 mb-10">
          <div className="relative w-[calc(41.66666%-2.5rem)] max-w-[360px] bg-white rounded-lg p-3">
            {author.image && <Image className='productImage' width={activeWidth} height={530} quality={100} alt='Active image' src={author.image} />}
          </div>
          <div className="h-full w-[calc(58.33333%-2.5rem)]">
            <h2 className="text-2xl">{author.authorName}</h2>
            {parse(author.description?.[locale] || author.description?.['en'] || '')}
          </div>
        </div>
        {sameAuthorProducts.length > 0 ? (<>
          <div className="font-semibold">Stuff from {author.authorName}:</div>
          <ProductSlider products={sameAuthorProducts} wishedProducts={wishedProducts} />
        </>) : (<div>{tSingleAuthorPage('no_products_yet')}</div>)}
      </Layout>
    </>
  );
};

export async function getServerSideProps(context) {
  await mongooseConnect();
  const session = await getServerSession(context.req, context.res, authOptions);
  let user = null;
  if (session?.user) { user = session.user; }

  const {id} = context.query;
  const author = await Author.findById(id);
  const sameAuthorProducts = await Product.find({authorId: author._id}, null, {sort: {'amountSold':-1}, limit:10});

  const wishedProducts = session?.user
    ? await WishedProduct.find({
        userEmail:session?.user.email,
        product: sameAuthorProducts.map(p => p._id.toString()),
      })
    : [];
  return {
    props: {
      messages: (await import(`@/locales/${context.locale}.json`)).default,
      author: JSON.parse(JSON.stringify(author)),
      sameAuthorProducts: JSON.parse(JSON.stringify(sameAuthorProducts)),
      wishedProducts: wishedProducts.map(i => i.product.toString()),
    }
  };
};
