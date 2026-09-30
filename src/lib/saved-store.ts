"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed id lists (favorites, compare) shared across tabs.
 * Works for guests; no account required to save or compare cars.
 */
function createListStore(key: string, max: number) {
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();

  const read = (): string[] => {
    if (cache) return cache;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
      cache = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, max) : [];
    } catch {
      cache = [];
    }
    return cache;
  };
  const write = (next: string[]) => {
    cache = next.slice(0, max);
    try {
      localStorage.setItem(key, JSON.stringify(cache));
    } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };
  const EMPTY: string[] = [];

  return {
    max,
    use: () => useSyncExternalStore(subscribe, read, () => EMPTY),
    has: (id: string) => read().includes(id),
    /** Returns false if the list is full and the id could not be added. */
    toggle: (id: string): boolean => {
      const cur = read();
      if (cur.includes(id)) {
        write(cur.filter((x) => x !== id));
        return true;
      }
      if (cur.length >= max) return false;
      write([...cur, id]);
      return true;
    },
    remove: (id: string) => write(read().filter((x) => x !== id)),
    clear: () => write([]),
  };
}

export const favoritesStore = createListStore("ah:favorites", 50);
export const compareStore = createListStore("ah:compare", 3);
