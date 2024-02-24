import Layout from "@/components/Layout";
import {Glow} from "@codaworks/react-glow";
import { Lock,Truck,Star, FileText, Mails } from "lucide-react";
import SettingsGlowButton from "@/components/SettingsGlowButton";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const tSettings = useTranslations('Settings');

  const settingsSubPages = [
    {
      page: 'admins',
      description: tSettings('admins_description'),
      icon: <Lock />,
    },
    {
      page: 'featured',
      description: tSettings('featured_description'),
      icon: <Star />,
      color: 'green',
    },
    {
      page: 'shipping',
      description: tSettings('shipping_description'),
      icon: <Truck />,
      color: 'purple',
    },
    {
      page: 'email_templates',
      description: tSettings('email_templates_description'),
      icon: <Mails />,
      color: 'yellow',
    },
    {
      page: 'docs',
      description: tSettings('docs_description'),
      icon: <FileText />,
      color: 'turquoise',
    },
  ];

  return (
    <Layout>
      <div className="grid grid-rows-3 md:grid-rows-1 md:grid-cols-3 gap-8 my-8">
        {settingsSubPages && settingsSubPages.map((subPage, index) => (
          <Glow key={`${subPage}+${index}`} color={subPage.color}>
            <SettingsGlowButton page={subPage.page} description={subPage.description} icon={subPage.icon} />
          </Glow>
        ))}
      </div>
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