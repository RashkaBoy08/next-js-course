type Product = {
  id: number;
  title: string;
};

type ProductsResponse = {
  products: Product[];
};

export default async function ProductsPage() {
  const response = await fetch("https://dummyjson.com/products?limit=5");

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const { products }: ProductsResponse = await response.json();

  return (
    <main>
      <h1>Products</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.title}</li>
        ))}
      </ul>
    </main>
  );
}
