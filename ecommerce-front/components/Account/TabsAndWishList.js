import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Globals/Spinner";
import ProductBox from "@/components/Products/ProductBox";
import SingleOrder from "@/components/Account/SingleOrder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

export default function TabsAndWishList() {
  const tAccount = useTranslations("Account");

  const { data: session } = useSession();
  const [wishlistLoaded, setWishlistLoaded] = useState(true);
  const [orderLoaded, setOrderLoaded] = useState(true);
  const [wishedProducts, setWishedProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!session) {
      return;
    }
    setWishlistLoaded(false);
    setOrderLoaded(false);
    axios.get("/api/wishlist").then((response) => {
      setWishedProducts(response.data.map((wp) => wp.product));
      setWishlistLoaded(true);
    });
    axios.get("/api/orders").then((response) => {
      setOrders(response.data);
      setOrderLoaded(true);
    });
  }, [session]);

  function productRemovedFromWishlist(idToRemove) {
    setWishedProducts((products) => {
      return [...products.filter((p) => p._id.toString() !== idToRemove)];
    });
  }

  return (
    <div className="rounded-lg p-7">
      <Tabs defaultValue="orders">
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value="orders">
            {tAccount("orders")}
          </TabsTrigger>
          <TabsTrigger className="flex-1" value="wishlist">
            {tAccount("wishlist")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          {!orderLoaded && <Spinner fullwidth={true} />}
          {orderLoaded && (
            <div>
              {orders.length === 0 && <p>{tAccount('no_orders')}</p>}
              {orders.length > 0 &&
                orders.map((o) => <SingleOrder key={o._id} {...o} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="wishlist">
          {!wishlistLoaded && <Spinner />}
          {wishlistLoaded && (
            <>
              <div className="flex items-center flex-wrap">
                {wishedProducts.length > 0 &&
                  wishedProducts.map((wp) => (
                    <ProductBox
                      key={wp._id}
                      {...wp}
                      wished={true}
                      onRemoveFromWishlist={productRemovedFromWishlist}
                    />
                  ))}
              </div>
              {wishedProducts.length === 0 && (
                <>
                  {session && <p>{tAccount('wishlist_empty')}</p>}
                  {!session && <p>{tAccount('login_to_add_wishlist')}</p>}
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
