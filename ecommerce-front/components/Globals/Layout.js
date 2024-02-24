import Center from "./Center";
import Header from "./Header";
import { Toaster } from "@/components/ui/toaster"
import ProductSlider from "../Products/ProductSlider";
import { useToast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { useNetwork } from "@/hooks/useNetwork";
import { useTranslations } from "next-intl";

export default function Layout({ isEmbedded=false,featuredProducts,children }) {
  const tLayoutToasts = useTranslations('Toasts');
  const [wasOffline, setWasOffline] = useState(false);
  const { toast } = useToast();
  const isOnline = useNetwork();

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      toast({
        title: tLayoutToasts('offline'),
        description: tLayoutToasts('check_your_connection'),
        status: "success",
        variant: "destructive",
        duration: 3000,
        isClosable: true,
      });
    };
    if (wasOffline && isOnline) {
      setWasOffline(false);
      toast({
        title: tLayoutToasts('you_are_online'),
        description: tLayoutToasts('welcome_back'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    };
  }, [isOnline]);
  return (
    <>
      {!isEmbedded && <Header />}
      {featuredProducts && featuredProducts.length > 0 && (
        <ProductSlider products={featuredProducts} isFeatured={true} />
      )}
      <Center>{children}</Center>

      {!isEmbedded && <Toaster />}
    </>
  );
}
