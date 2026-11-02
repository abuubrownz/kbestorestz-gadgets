import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products as seedProducts, type Product } from "./data";

/**
 * Shared product catalogue.
 *
 * Admin edits and technician stock changes both write here, and the storefront
 * (homepage, /products, product detail, cart) reads from the same source.
 * Changes persist in localStorage until the Supabase catalogue migration is
 * approved and applied; swapping this provider for a Supabase-backed one is the
 * only change needed at that point.
 */
const STORAGE_KEY = "kbestoretz.catalogue.v1";

type CatalogueContextValue = {
  products: Product[];
  getById: (id: string) => Product | undefined;
  byCategory: (category: string) => Product[];
  counts: Record<string, number>;
  stockCounts: Record<string, number>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  setStock: (id: string, stock: number) => void;
  adjustStock: (id: string, delta: number) => void;
  resetCatalogue: () => void;
};

const CatalogueContext = createContext<CatalogueContextValue | null>(null);

function readStored(): Product[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as Product[];
  } catch {
    return null;
  }
}

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(seedProducts);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) setItems(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage can be unavailable in private mode — keep the in-memory catalogue */
    }
  }, [items, hydrated]);

  const addProduct = useCallback((product: Product) => {
    setItems((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
  }, []);

  const updateProduct = useCallback((product: Product) => {
    setItems((prev) => prev.map((p) => (p.id === product.id ? product : p)));
  }, []);

  const setStock = useCallback((id: string, stock: number) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, Math.floor(stock)) } : p)),
    );
  }, []);

  const adjustStock = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, Math.floor(p.stock + delta)) } : p,
      ),
    );
  }, []);

  const resetCatalogue = useCallback(() => setItems(seedProducts), []);

  const value = useMemo<CatalogueContextValue>(() => {
    const counts: Record<string, number> = {};
    const stockCounts: Record<string, number> = {};
    for (const product of items) {
      counts[product.category] = (counts[product.category] ?? 0) + 1;
      stockCounts[product.category] = (stockCounts[product.category] ?? 0) + product.stock;
    }
    return {
      products: items,
      getById: (id) => items.find((p) => p.id === id),
      byCategory: (category) => items.filter((p) => p.category === category),
      counts,
      stockCounts,
      addProduct,
      updateProduct,
      setStock,
      adjustStock,
      resetCatalogue,
    };
  }, [items, addProduct, updateProduct, setStock, adjustStock, resetCatalogue]);

  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue() {
  const ctx = useContext(CatalogueContext);
  if (!ctx) throw new Error("useCatalogue must be used inside CatalogueProvider");
  return ctx;
}
