import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ShoppingCart } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "../../CartContext";
import SidebarCart from "./SidebarCart";
import { useTranslations } from "next-intl";

export default function Sidebar() {
  const tSidebar = useTranslations('Cart.Sidebar');
  const {cartProducts} = useContext(CartContext);

  return (
    <Sheet className="">
      <SheetTrigger className="relative">
        <ShoppingCart className="text-foreground sm:w-5 sm:h-5 w-6 h-6" />
        <div className="absolute top-[-7px] right-[-7px] flex items-center justify-center sm:w-4 sm:h-4 w-5 h-5 bg-background text-foreground text-xs rounded-full">{cartProducts.length}</div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className='mb-3'>
          <SheetTitle>{tSidebar('shopping_cart')}</SheetTitle>
        </SheetHeader>
        <SidebarCart />
      </SheetContent>
    </Sheet>
  );
};