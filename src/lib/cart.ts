"use client";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  color: {
    id: string;
    name: string;
    hex: string;
    image?: string;
  };
  image: string;
  quantity: number;
}

const CART_STORAGE_KEY = "ssp_store_cart_v1";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse cart from localStorage", e);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("ssp_cart_updated"));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
}

export function addToCart(item: CartItem): void {
  const current = getCart();
  const existingIndex = current.findIndex(
    (i) => i.id === item.id && i.color.id === item.color.id
  );

  if (existingIndex > -1) {
    current[existingIndex].quantity += item.quantity;
  } else {
    current.push(item);
  }

  saveCart(current);
}

export function updateQuantity(id: string, colorId: string, delta: number): void {
  const current = getCart();
  const index = current.findIndex((i) => i.id === id && i.color.id === colorId);
  if (index > -1) {
    current[index].quantity += delta;
    if (current[index].quantity <= 0) {
      current.splice(index, 1);
    }
    saveCart(current);
  }
}

export function removeFromCart(id: string, colorId: string): void {
  const current = getCart();
  const filtered = current.filter((i) => !(i.id === id && i.color.id === colorId));
  saveCart(filtered);
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartCount(): number {
  const current = getCart();
  return current.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  const current = getCart();
  return current.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
