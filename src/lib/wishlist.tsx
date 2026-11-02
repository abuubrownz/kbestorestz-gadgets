import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";

/**
 * Member wishlist.
 *
 * Saving is an account benefit: each signed-in user gets their own list, kept
 * on this device under `kbestoretz.wishlist.<userId>`. Signing out clears the
 * in-memory list so the next person on the device does not see it.
 */
const keyFor = (userId: string) => `kbestoretz.wishlist.${userId}`;

type WishlistContextValue = {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  /** Adds or removes the product. Returns true when it is now saved. */
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStored(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const userId = user?.id ?? null;
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!ready) return;
    setIds(userId ? readStored(userId) : []);
  }, [ready, userId]);

  useEffect(() => {
    if (!ready || !userId) return;
    try {
      window.localStorage.setItem(keyFor(userId), JSON.stringify(ids));
    } catch {
      /* storage blocked — keep the in-memory list */
    }
  }, [ids, ready, userId]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) => {
      const saved = !ids.includes(id);
      setIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [id, ...prev]));
      return saved;
    },
    [ids],
  );

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, count: ids.length, has, toggle, remove, clear }),
    [ids, has, toggle, remove, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
