export default function SingleOrder({line_items,createdAt,...rest}) {
  return (
    <div className="flex items-center gap-5 my-2.5 mx-0 py-2.5 px-0 border border-solid border-[#ddd]">
      <div>
        <time className="text-[#555]">{(new Date(createdAt)).toLocaleString('sv-SE')}</time>
        <div className="text-sm leading-4 mt-1.5 text-[#888]">
          {rest.name}<br />
          {rest.email}<br />
          {rest.streetAddress}<br />
          {rest.postalCode} {rest.city}, {rest.country}
        </div>
      </div>
      <div>
        {line_items.map(item => (
          <div key={item.price_data.product_data.name }>
            <span className="text-[#aaa]">{item.quantity} x </span>
            {item.price_data.product_data.name}
          </div>
        ))}
      </div>
    </div>
  );
}