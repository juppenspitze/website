import Layout from "@/components/Layout";
import HomeHeader from "@/components/HomeHeader";
import HomeStats from "@/components/HomeStats";

export default function Home() {
  return (
    <Layout>
      <HomeHeader />
      <HomeStats />
    </Layout>
  );
};

export async function getServerSideProps(context) {
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
    }
  };
};