"use client";

import { useEffect, useState } from "react";

type WarehouseStock = {
  warehouseId: string;
  warehouseName: string;
  location: string;
  availableQuantity: number;
};

type Product = {
  id: string;
  name: string;
  description: string;
  warehouses: WarehouseStock[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      setLoading(true);
     const res = await fetch("/api/products", {
  cache: "no-store",
});
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load products");
        return;
      }

      setProducts(data);
    } catch {
      setMessage("Products are loading slowly. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();

    const onFocus = () => loadProducts();
    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  async function reserve(productId: string, warehouseId: string) {
    setMessage("");

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, warehouseId, quantity: 1 }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Reservation failed");
      await loadProducts();
      return;
    }

    window.location.href = `/reservation/${data.id}`;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="mb-8 text-4xl font-bold text-black">
        Allo Inventory Reservation
      </h1>

      {message && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 shadow">
          {message}
        </div>
      )}

      {loading && (
        <div className="rounded-xl bg-white p-6 text-lg font-semibold shadow">
          Loading products...
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-lg font-semibold shadow">
          No products found. Try refreshing once.
        </div>
      )}

      <div className="grid gap-6">
        {products.map((product) => (
          <div key={product.id} className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-black">{product.name}</h2>
            <p className="mt-1 text-gray-700">{product.description}</p>

            <div className="mt-5 grid gap-4">
              {product.warehouses.map((warehouse) => (
                <div
                  key={warehouse.warehouseId}
                  className="flex items-center justify-between rounded-xl border border-gray-300 bg-gray-50 p-5"
                >
                  <div>
                    <p className="text-lg font-semibold text-black">
                      {warehouse.warehouseName}
                    </p>
                    <p className="text-sm text-gray-600">{warehouse.location}</p>
                    <p className="mt-1 font-medium text-blue-700">
                      Available: {warehouse.availableQuantity}
                    </p>
                  </div>

                  <button
                    onClick={() => reserve(product.id, warehouse.warehouseId)}
                    disabled={warehouse.availableQuantity <= 0}
                    className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    Reserve
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}