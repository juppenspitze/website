export default function Table(props) {
  return (
    <table className="
      w-full 
      [&>td]:border-t [&>td]:border-solid [&>td]:border-[rgba(0,0,0,.1)]
      [&>th]:text-left [&>th]:uppercase [&>th]:text-[#ccc] [&>th]:font-semibold [&>th]:text-xs
    " 
      {...props} />
  )
}