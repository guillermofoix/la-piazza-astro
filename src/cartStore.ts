import { atom, computed } from "nanostores";
import Cookies from "js-cookie";
import { getCart } from "@/lib/shopify";
import {
  addItem,
  removeItem,
  updateItemQuantity,
} from "@/lib/utils/cartActions";
import type { Cart } from "@/lib/shopify/types";

// Atom to hold the cart state
export const cart = atom<Cart | null>(null);

// Atom to manage the layout view state (card or list)
export const layoutView = atom<"card" | "list">("card");

// Atom to manage cart visibility (global)
export const isCartOpen = atom<boolean>(false);

// Computed store for total quantity in the cart
export const totalQuantity = computed(cart, (c) => (c ? c.totalQuantity : 0));

// Function to set a new layout view
export function setLayoutView(view: "card" | "list") {
  layoutView.set(view);
}

// Function to get the current layout view
export function getLayoutView() {
  return layoutView.get();
}

const isServer = typeof window === "undefined";

// Update cart state in the store
export async function refreshCartState() {
  if (isServer) return; // Don't try to sync on server side

  const cartId = Cookies.get("cartId") || "mock-cart-id";
  const currentCart = await getCart(cartId);
  if (currentCart) {
    cart.set({ ...currentCart } as any);
  }
}

// Add item to the cart and update state
export async function addItemToCart(selectedVariantId: string) {
  try {
    await addItem(selectedVariantId);
    await refreshCartState();
    isCartOpen.set(true); // Automatically open cart on success
    return "Added to cart";
  } catch (error: any) {
    throw new Error(error.message || "Failed to add to cart");
  }
}

// Remove item from the cart and update state
export async function removeItemFromCart(lineId: string) {
  try {
    await removeItem(lineId);
    await refreshCartState();
    return "Removed from cart";
  } catch (error: any) {
    throw new Error(error.message || "Failed to remove item from cart");
  }
}

// Update item quantity in the cart and update state
export async function updateCartItemQuantity(payload: {
  lineId: string;
  variantId: string;
  quantity: number;
}) {
  try {
    await updateItemQuantity(payload);
    await refreshCartState();
    return "Cart updated";
  } catch (error: any) {
    throw new Error(error.message || "Failed to update cart");
  }
}
