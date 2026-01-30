import React, { useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { removeItemFromCart } from "@/cartStore";
import LoadingDots from "../loadings/LoadingDots";

interface DeleteItemButtonProps {
  item: {
    id: string;
  };
}

const DeleteItemButton: React.FC<DeleteItemButtonProps> = ({ item }) => {
  const [pending, setPending] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;

    setPending(true);
    try {
      await removeItemFromCart(item.id);
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={pending}
      aria-label="Remove cart item"
      className={`flex h-5 w-5 items-center justify-center rounded-full bg-neutral-500 hover:bg-red-500 transition-colors duration-200 shadow-sm ${
        pending ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      }`}
    >
      {pending ? (
        <LoadingDots className="bg-white" />
      ) : (
        <FaXmark className="h-3 w-3 text-white" />
      )}
    </button>
  );
};

export default DeleteItemButton;
