import { prettyDate } from "@/lib/date";
import currencyForm from "@/lib/handlers";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function OrderData({ order, shipmentMethod }) {
  const tOrderData = useTranslations('Orders');
  return (<>
    <div className="flex flex-col gap-3 print:gap-1 [&>div>span]:text-sm print:[&>div>span]:text-xs print:[&>div>div]:text-sm">
      <div className="hidden print:block">
        <span className="text-textSecondary">{tOrderData('payment_and_shipment_status')}</span>
        <div className="mt-[-3px]">{order.paid ? tOrderData('paid') : tOrderData('not_paid')} / {order.state}</div>
      </div>
      <div>
        <span className="text-textSecondary">{tOrderData('customer_name')}</span>
        <div className="mt-[-3px]">{order.name}</div>
      </div>
      <div>
        <span className="text-textSecondary">{tOrderData('shipment_address')}</span>
        <div className="mt-[-3px]">{order.streetAddress}, {order.city}, {order.postalCode}, {order.country}</div>
      </div>
      <div>
        <span className="text-textSecondary">{tOrderData('billing_address')}</span>
        {order.isBillAddress ? (
          <div className="mt-[-3px]">{order.billStreetAddress}, {order.billCity}, {order.billPostalCode}, {order.billCountry}</div>
        ) : (
          <div className="mt-[-3px]">{order.streetAddress}, {order.city}, {order.postalCode}, {order.country}</div>
        )}
      </div>

      <div>
        <span className="text-textSecondary">{tOrderData('shipment_method')}</span>
        {shipmentMethod ? (
          <div className="flex gap-2 items-center mt-[-3px]">
            <div className="w-fit">{shipmentMethod.name}</div>
          </div>
        ) : (<div>Not provided</div>)}
      </div>

      <div>
        <span className="text-textSecondary">{tOrderData('email')}</span>
        <div className="mt-[-3px]">{order.email ? order.email : 'Not provided'}</div>
      </div>

      <div>
        <span className="text-textSecondary">{tOrderData('phone_number')}</span>
        <div className="mt-[-3px]">{order.phoneNum ? order.phoneNum : 'Not provided'}</div>
      </div>

      <div>
        <span className="text-textSecondary">{tOrderData('products_ordered')}</span>
        {order.line_items && order.line_items.map((item,index) => (
          <div className="mt-[-3px]" key={`${index}${item.quantity}`}>
            <span className="text-textSecondary">{item.quantity} x</span> {item.price_data.product_data.name} <span className="text-textSecondary">{currencyForm(item.price_data.unit_amount / 100)}</span>
          </div>
        ))}
      </div>

      <div>
        <span className="text-textSecondary">{tOrderData('ordered_on')}</span>
        <div className="mt-[-3px]">{order.createdAt && prettyDate(order.createdAt)}</div>
      </div>

        <div>
          <span className="text-textSecondary">{tOrderData('payment_method')}</span>
          {order.paymentBrand && order.paymentLast4 ? (
            <div className="flex items-center gap-2 w-fit mt-[-3px]">
              <Image src={`/images/${order.paymentBrand}.png`} width={30} height={20} alt={order.paymentBrand} className=" mr-2" />
              <span className="text-lg">**** **** ****</span> <span className="text-base">{order.paymentLast4}</span>
            </div>
          ) : (<div className="mt-[-3px]">Not provided</div>)}
        </div>
    </div>
  </>);
};