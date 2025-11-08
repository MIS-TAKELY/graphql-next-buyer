import CategorySection from "./Category";
import ProductGrid from "./ProductGrid";

const Main = () => {
  return (
    <main className="pt-4 pb-8 bg-background">
      <div className="container ultra-wide-container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 space-y-6 sm:space-y-8">
        <CategorySection title="Best Deals on Electronics" category="Electronics" />
        <CategorySection title="Best Deals on Furniture" category="Furniture" />
        <CategorySection title="Best Deals on Fashion" category="Fashion" />
        <ProductGrid />
      </div>
    </main>
  );
};

export default Main;