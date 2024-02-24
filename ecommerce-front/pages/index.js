import {Product} from "@/models/Product";
import {mongooseConnect} from "@/lib/mongoose";
import NewProducts from "@/components/Products/NewProducts";
import {WishedProduct} from "@/models/WishedProduct";
import {getServerSession} from "next-auth";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import { Analytics } from '@vercel/analytics/react';
import Layout from "@/components/Globals/Layout";
import { FeaturedProduct } from "@/models/FeaturedProduct";
import ExploreSection from "@/components/Globals/ExploreSection";

export default function HomePage({featuredProducts,newProducts,wishedNewProducts}) {
  return (
    <div className="flex flex-col pb-20">
      <Layout featuredProducts={featuredProducts}>
        <NewProducts products={newProducts} wishedProducts={wishedNewProducts} />
        <ExploreSection products={newProducts} wishedProducts={wishedNewProducts} />
      </Layout>

      <Analytics />
    </div>
  );
}

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  let featuredProducts = await FeaturedProduct.find({}, null, {sort: {'orderIndex':1}});
  for (let i = 0; i < featuredProducts.length; i++) {
    if (featuredProducts[i].existingId) {
      let prod = await Product.findById(featuredProducts[i].existingId);
      featuredProducts[i] = featuredProducts[i].toObject();
      featuredProducts[i] = {...featuredProducts[i], ...prod.toObject()};
    } else featuredProducts.splice(i, 1);
  };
  const newProducts = await Product.find({}, null, {sort: {'_id':-1}, limit:10});
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const wishedNewProducts = session?.user
    ? await WishedProduct.find({
        userEmail:session.user.email,
        product: newProducts.map(p => p._id.toString()),
      })
    : [];
  return {
    props: {
      messages: (await import(`@/locales/${ctx.locale}.json`)).default,
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      newProducts: JSON.parse(JSON.stringify(newProducts)),
      wishedNewProducts: wishedNewProducts.map(i => i.product.toString()),
    },
  };
}
