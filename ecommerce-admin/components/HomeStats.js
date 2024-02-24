import {useEffect, useState} from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import {subHours} from "date-fns";
import { handleApiCall } from "@/lib/handlers";
import { useTranslations } from "next-intl";

export default function HomeStats() {
  const tHomeStats = useTranslations('HomeStats');

  const [orders,setOrders] = useState([]);
  const [isLoading,setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const apiCall = async () => {
      const res = await handleApiCall(axios.get('/api/orders'), 'fetching orders', false);
      setOrders(res.data);
    };
    apiCall();
    setIsLoading(false);
  }, []);

  function ordersTotal(orders) {
    let sum = 0;
    orders.forEach(order => {
      const {line_items} = order;
      line_items.forEach(li => {
        const lineSum = li.quantity * li.price_data.unit_amount / 100;
        sum += lineSum;
      });
    });
    return new Intl.NumberFormat('au-AU').format(sum);
  };

  if (isLoading) {
    return (
      <div className="my-4">
        <Spinner fullwidth={true} />
      </div>
    );
  };

  const ordersToday = orders.filter(o =>  new Date(o.createdAt) > subHours(new Date, 24));
  const ordersWeek = orders.filter(o =>  new Date(o.createdAt) > subHours(new Date, 24*7));
  const ordersMonth = orders.filter(o =>  new Date(o.createdAt) > subHours(new Date, 24*30));

  return (
    <div>
      <div className="font-semibold text-lg text-primary mb-2">{tHomeStats('orders')}</div>
      <div className="tiles-grid mb-4">
        <div className="tile">
          <h3 className="tile-header">{tHomeStats('today')}</h3>
          <div className="tile-number">{ordersToday.length}</div>
          <div className="tile-desc">{ordersToday.length} {tHomeStats('orders_today')}</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">{tHomeStats('this_week')}</h3>
          <div className="tile-number">{ordersWeek.length}</div>
          <div className="tile-desc">{ordersWeek.length} {tHomeStats('orders_this_week')}</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">{tHomeStats('this_month')}</h3>
          <div className="tile-number">{ordersMonth.length}</div>
          <div className="tile-desc">{ordersMonth.length} {tHomeStats('orders_this_month')}</div>
        </div>
      </div>
      <div className="font-semibold text-lg text-primary mb-2">{tHomeStats('revenue')}</div>
      <div className="tiles-grid">
        <div className="tile">
          <h3 className="tile-header">{tHomeStats('today')}</h3>
          <div className="tile-number">€ {ordersTotal(ordersToday)}</div>
          <div className="tile-desc">{ordersToday.length} {tHomeStats('orders_today')}</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">{tHomeStats('this_week')}</h3>
          <div className="tile-number">€ {ordersTotal(ordersWeek)}</div>
          <div className="tile-desc">{ordersWeek.length} {tHomeStats('orders_this_week')}</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">{tHomeStats('this_month')}</h3>
          <div className="tile-number">€ {ordersTotal(ordersMonth)}</div>
          <div className="tile-desc">{ordersMonth.length} {tHomeStats('orders_this_month')}</div>
        </div>
      </div>
    </div>
  );
}