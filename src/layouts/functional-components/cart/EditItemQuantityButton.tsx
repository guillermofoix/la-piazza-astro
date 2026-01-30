import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { updateCartItemQuantity } from "@/cartStore";
import type { CartItem } from "@/lib/shopify/types";
import LoadingDots from "../loadings/LoadingDots";

interface Props {
  item: CartItem;
  type: "plus" | "minus";
}

const EditItemQuantityButton: React.FC<Props> = ({ item, type }) => {
  const [pending, setPending] = useState(false);

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (pending) return;

    const newQuantity = type === "plus" ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity < 1) return;

    setPending(true);
    try {
      await updateCartItemQuantity({
        lineId: item.id,
        variantId: item.merchandise.id,
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Error updating item quantity:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={pending || (type === "minus" && item.quantity <= 1)}
      type="button"
      aria-label={type === "plus" ? "Increase quantity" : "Reduce quantity"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 ${
        pending ? "cursor-not-allowed opacity-50" : ""
      } ${type === "minus" && item.quantity <= 1 ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {pending ? (
        <LoadingDots className="bg-black dark:bg-white" />
      ) : type === "plus" ? (
        <FaPlus className="h-3 w-3" />
      ) : (
        <FaMinus className="h-3 w-3" />
      )}
    </button>
  );
};

export default EditItemQuantityButton;
