import { currencyForm } from "@/lib/handlers";
import { HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export default function MoneyLine({ cartProducts, products, countryFee=0, profileFee=0, vatFee, setVatFee, vatPercentages=[]}) {
  const tMoneyLine = useTranslations('Cart.Final');

  const [totalProductFee, setTotalProductFee] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  
  useEffect(() => {
    calculateFees();
  }, [cartProducts, products, countryFee, profileFee]);

  function calculateFees() {
    let shipmentTotal = countryFee + profileFee;
    let productsTotal = 0;
    let vatTotal = 0;
    for (const productId of cartProducts) {
      const prod = products.find((p) => p._id === productId || p.electronicId === productId);
      if (!prod) continue;
      productsTotal += prod?.price || 0;
      vatTotal += (prod?.vatPercentage / 100) * prod?.price || 0;
    };
    setVatFee(vatTotal);
    setShippingFee(shipmentTotal);
    setTotalProductFee(productsTotal);
    setTotalFee(shipmentTotal + productsTotal);
  };

  return (
    <div className='flex items-center justify-between py-3 p-6 rounded-lg bg-foreground text-background'>
      <div className='relative group'>
        {tMoneyLine('products')}: {currencyForm(totalProductFee)}
        <HelpCircle className='w-[14px] h-[14px] mb-2 inline-block ml-1 text-muted-foreground cursor-pointer'/>
        <div className='absolute hidden group-hover:flex flex-col gap-1.5 p-3 py-2 bg-foreground text-background text-sm rounded-lg border border-solid border-muted-foreground z-50'>
          <span className="text-sm whitespace-nowrap">Inludes VAT: {currencyForm(vatFee)}</span>
        </div>
      </div>
      <div className='relative group'>
        VAT: {currencyForm(vatFee)} 
        <HelpCircle className='w-[14px] h-[14px] mb-2 inline-block ml-1 text-muted-foreground cursor-pointer'/>
        <div className='absolute hidden group-hover:flex flex-col gap-1.5 p-3 py-2 bg-foreground text-background text-sm rounded-lg border border-solid border-muted-foreground z-50'>
          {vatPercentages && vatPercentages.map((v, i) => (
            <span key={i} className='text-xs whitespace-nowrap'>{v.categoryName}: {v.percentage}%</span>
          ))}
        </div>
      </div>
      <div className='relative group'>
        {tMoneyLine('shipping')}: {currencyForm(shippingFee)} 
        <HelpCircle className='w-[14px] h-[14px] mb-2 inline-block ml-1 text-muted-foreground cursor-pointer'/>
        <div className='absolute hidden group-hover:flex flex-col gap-1.5 p-3 py-2 bg-foreground text-background text-sm rounded-lg border border-solid border-muted-foreground z-50'>
          <span className='text-xs whitespace-nowrap'>{tMoneyLine('country_fee')}: {currencyForm(countryFee)}</span>
          <span className='text-xs whitespace-nowrap'>{tMoneyLine('size_fee')}: {currencyForm(profileFee)}</span>
        </div>
      </div>
      <div className='text-xl text-background'>
        {tMoneyLine('total')}: {currencyForm(totalFee)}
      </div>
    </div>
  );
};