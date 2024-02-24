export default function DynamicBg({children}) {

  return (
    <main className="flex items-center justify-center min-h-[100vh]">
      <div className="flex items-center justify-center lightBulb">
        {children}
      </div>
    </main>
  );
}