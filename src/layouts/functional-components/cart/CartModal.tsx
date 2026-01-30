import { cart, refreshCartState, totalQuantity, isCartOpen } from "@/cartStore";
import { DEFAULT_OPTION } from "@/lib/constants";
import { createUrl } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import React, { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import LoadingDots from "../loadings/LoadingDots";
import Price from "../Price";
import CloseCart from "./CloseCart";
import DeleteItemButton from "./DeleteItemButton";
import EditItemQuantityButton from "./EditItemQuantityButton";
import OpenCart from "./OpenCart";

const CartModal: React.FC = () => {
  const currentCart = useStore(cart);
  const quantity = useStore(totalQuantity);
  const isOpen = useStore(isCartOpen);
  const [loading, setLoading] = useState(true);

  // Refresh the cart when the component mounts
  useEffect(() => {
    async function initializeCart() {
      try {
        await refreshCartState();
      } catch (error) {
        console.error("Failed to refresh cart:", error);
      } finally {
        setLoading(false);
      }
    }

    initializeCart(); // Initialize cart on mount
  }, []);

  // Handlers for opening and closing the cart
  const openCart = () => {
    isCartOpen.set(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling when the cart is open
  };

  const closeCart = () => {
    isCartOpen.set(false);
    document.body.style.overflow = ""; // Re-enable scrolling when the cart is closed
  };

  const cartContent =
    !currentCart || currentCart.lines.length === 0 || quantity === 0 ? (
      <div className="flex flex-col justify-center items-center space-y-6 my-auto py-10">
        <div>
          <FaShoppingCart size={76} />
        </div>
        <p>Oops. Your Bag Is Empty.</p>
        <a href="/products" className="btn btn-primary w-full">
          Don't Miss Out: Add Product
        </a>
      </div>
    ) : (
      <div className="flex h-full flex-col justify-between overflow-hidden p-1">
        <ul className="flex-grow overflow-auto py-4 max-h-[60vh]">
          {currentCart.lines.map((item: any) => {
            const product = item?.merchandise?.product;
            if (!product) return null;

            const merchandiseSearchParams: Record<string, string> = {};
            item.merchandise.selectedOptions?.forEach(
              ({ name, value }: any) => {
                if (value !== DEFAULT_OPTION) {
                  merchandiseSearchParams[name.toLowerCase()] = value;
                }
              },
            );

            const merchandiseUrl = createUrl(
              `/products/${product.handle}`,
              new URLSearchParams(merchandiseSearchParams),
            );

            return (
              <li
                key={item.id}
                className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
              >
                <div className="relative flex w-full flex-row justify-between px-1 py-4">
                  <div className="absolute z-40 -mt-2 ml-[55px]">
                    <DeleteItemButton item={item} />
                  </div>
                  <a
                    href={merchandiseUrl.toString()}
                    className="z-30 flex flex-row space-x-4"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300">
                      <img
                        className="h-full w-full object-cover"
                        src={
                          product.images?.edges?.find(
                            (edge: any) =>
                              edge.node.altText ===
                              item.merchandise.selectedOptions?.find(
                                (option: any) => option.name === "Color",
                              )?.value,
                          )?.node.url ||
                          product.featuredImage?.url ||
                          "/images/product-placeholder.jpg"
                        }
                        alt={item.merchandise.title}
                        width={64}
                        height={64}
                      />
                    </div>
                    <div className="flex flex-1 flex-col text-base">
                      <span>{product.title}</span>
                      {item.merchandise.title !== DEFAULT_OPTION && (
                        <p className="text-sm text-neutral-500">
                          {item.merchandise.title}
                        </p>
                      )}
                    </div>
                  </a>
                  <div className="flex h-16 flex-col justify-between ml-1">
                    <Price
                      amount={item.cost.totalAmount.amount}
                      currencyCode={item.cost.totalAmount.currencyCode}
                    />
                    <div className="flex items-center space-x-2">
                      <EditItemQuantityButton item={item} type="minus" />
                      <p>{item.quantity}</p>
                      <EditItemQuantityButton item={item} type="plus" />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
          <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
            <p>Total</p>
            <Price
              className="text-right text-base text-black dark:text-white"
              amount={currentCart.cost.totalAmount.amount}
              currencyCode={currentCart.cost.totalAmount.currencyCode}
            />
          </div>
        </div>
        <a
          href={currentCart.checkoutUrl}
          className="block w-full rounded-md bg-dark dark:bg-light p-3 text-center text-sm font-medium text-white dark:text-text-dark opacity-100 hover:opacity-90 mb-2"
        >
          Ir a Pagar
        </a>
        <button
          onClick={closeCart}
          className="block w-full rounded-md border border-neutral-300 dark:border-neutral-700 p-3 text-center text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Seguir Comprando
        </button>
      </div>
    );

  return (
    <>
      <div className="cursor-pointer" aria-label="Open cart" onClick={openCart}>
        <OpenCart quantity={quantity} />
      </div>

      <div
        id="cartOverlay"
        className={`fixed inset-0 bg-black opacity-50 z-40 transition-opacity ${isOpen ? "block" : "hidden"}`}
        onClick={closeCart}
      ></div>

      <div
        id="cartDialog"
        className={`fixed inset-y-0 right-0 z-50 w-full md:w-[390px] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-fit min-h-[300px] flex flex-col border-l border-b drop-shadow-lg rounded-bl-md border-neutral-200 bg-body p-6 text-black dark:border-neutral-700 dark:bg-darkmode-body dark:text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-lg font-semibold">Your Cart</p>
            <button aria-label="Close cart" onClick={closeCart}>
              <CloseCart />
            </button>
          </div>
          <div className="w-full h-px bg-dark dark:bg-light mb-4 text-transparent shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            .
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingDots className="bg-black dark:bg-white" />
            </div>
          ) : (
            cartContent
          )}
        </div>
      </div>
    </>
  );
};

export default CartModal;
