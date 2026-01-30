import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "@/lib/constants";
import { isShopifyError } from "@/lib/typeGuards";
import { ensureStartsWith } from "@/lib/utils";
import type {
  Cart,
  Collection,
  Connection,
  CustomerInput,
  Image,
  Menu,
  Page,
  PageInfo,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  registerOperation,
  user,
  userOperation,
  ProductVariant,
} from "./types";

const domain = import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

// ==========================================
// MOCK DATA FACTORY (ULTRA-STABLE)
// ==========================================

const createConnection = (items: any[]) => ({
  edges: items.map(node => ({ node }))
});

const hydrateProduct = (p: any): Product => {
  if (!p) return p;
  
  const collectionName = p.category || 'Pizzas';
  if (!p.collections) p.collections = { nodes: [{ title: collectionName }], edges: [{ node: { title: collectionName } }] };
  if (!p.collections.nodes) p.collections.nodes = [{ title: collectionName }];

  if (Array.isArray(p.images)) {
    const edges = p.images.map((node: any) => ({ node }));
    (p.images as any).edges = edges;
  }
  
  if (Array.isArray(p.variants)) {
    const edges = p.variants.map((node: any) => ({ node }));
    (p.variants as any).edges = edges;
  }

  return p as Product;
};

const createMockProduct = (id: string, title: string, handle: string, desc: string, imgUrl: string, price: string, category: string = 'Pizzas', vendor: string = 'La Piazza'): Product => {
  const img: Image = { url: imgUrl, altText: title, width: 800, height: 800 };
  return hydrateProduct({
    id,
    title,
    handle,
    description: desc,
    descriptionHtml: `<p>${desc}</p>`,
    category,
    availableForSale: true,
    featuredImage: img,
    images: [img],
    variants: [
      { id: `v-${id}`, title: 'Normal', price: { amount: price, currencyCode: 'EUR' }, availableForSale: true, selectedOptions: [] }
    ],
    priceRange: {
      minVariantPrice: { amount: price, currencyCode: 'EUR' },
      maxVariantPrice: { amount: price, currencyCode: 'EUR' }
    },
    compareAtPriceRange: {
      maxVariantPrice: { amount: '0.0', currencyCode: 'EUR' }
    },
    tags: [category.toLowerCase(), 'comida', title.toLowerCase().split(' ')[0]],
    vendor,
    options: [{ id: `opt-${id}`, name: 'Tamaño', values: ['Normal'] }],
    updatedAt: new Date().toISOString(),
    seo: { title, description: desc }
  });
};

const MOCK_PRODUCTS = [
  // PIZZAS
  createMockProduct('p1', 'Pizza Margarita', 'pizza-margarita', 'La clásica italiana con tomate San Marzano y mozzarella fresca.', 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80', '12.00', 'Pizzas'),
  createMockProduct('p2', 'Pizza Pepperoni', 'pizza-pepperoni', 'Picante y sabrosa, con pepperoni de primera calidad.', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', '14.50', 'Pizzas'),
  createMockProduct('p3', 'Pizza Cuatro Quesos', 'pizza-cuatro-quesos', 'Mezcla perfecta de mozzarella, gorgonzola, parmesano y emmental.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', '15.00', 'Pizzas'),
  createMockProduct('p4', 'Pizza Vegetariana', 'pizza-vegetariana', 'Pimientos, cebolla, champiñones, aceitunas y calabacín.', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80', '13.50', 'Pizzas'),
  createMockProduct('p5', 'Pizza Barbacoa', 'pizza-barbacoa', 'Salsa barbacoa, carne picada, pollo y cebolla caramelizada.', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', '16.00', 'Pizzas'),
  
  // PASTAS
  createMockProduct('p6', 'Espaguetis Carbonara', 'espaguetis-carbonara', 'Receta tradicional con huevo, guanciale y pecorino.', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80', '11.00', 'Pastas'),
  createMockProduct('p7', 'Lasaña de Carne', 'lasana-carne', 'Láminas de pasta con boloñesa casera y bechamel.', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', '12.50', 'Pastas'),
  createMockProduct('p8', 'Penne al Pesto', 'penne-pesto', 'Pasta corta con salsa de albahaca fresca, piñones y parmesano.', 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80', '10.50', 'Pastas'),

  // ENTRANTES
  createMockProduct('p9', 'Pan de Ajo', 'pan-ajo', 'Pan tostado con mantequilla de ajo y perejil.', 'https://images.unsplash.com/photo-1767065886239-24a0b8975b24?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0', '4.50', 'Entrantes'),
  createMockProduct('p10', 'Bruschetta Italiana', 'bruschetta', 'Pan tostado con tomate picado, ajo y aceite de oliva.', 'https://plus.unsplash.com/premium_photo-1677686707252-16013f466e61?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YnJ1c2NoZXR0YXxlbnwwfHwwfHx8MA%3D%3D', '6.00', 'Entrantes'),
  createMockProduct('p11', 'Ensalada Caprese', 'ensalada-caprese', 'Tomate, mozzarella de búfala y albahaca fresca.', 'https://images.unsplash.com/photo-1602881917760-7379db593981?auto=format&fit=crop&w=800&q=80', '9.50', 'Entrantes'),

  // POSTRES
  createMockProduct('p12', 'Tiramisú Casero', 'tiramisu', 'El postre italiano por excelencia, con café y mascarpone.', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80', '6.50', 'Postres'),
  createMockProduct('p13', 'Panna Cotta', 'panna-cotta', 'Nata cocida con vainilla y frutos rojos.', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', '5.50', 'Postres')
];

// ==========================================
// PERSISTENT CART LOGIC
// ==========================================

const CART_KEY = 'la-piazza-cart-vstable-v-final-production';
const isServer = typeof window === 'undefined';

let localCart: Cart = {
  id: 'mock-cart-id',
  checkoutUrl: '/checkout',
  cost: {
    subtotalAmount: { amount: '0.0', currencyCode: 'EUR' },
    totalAmount: { amount: '0.0', currencyCode: 'EUR' },
    totalTaxAmount: { amount: '0.0', currencyCode: 'EUR' }
  },
  lines: [],
  totalQuantity: 0
};

if (!isServer) {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        parsed.lines?.forEach((l: any) => { if(l.merchandise?.product) l.merchandise.product = hydrateProduct(l.merchandise.product); });
        localCart = parsed;
    }
  } catch (e) {}
}

function syncCart() {
  const subtotal = localCart.lines.reduce((acc, l) => acc + (parseFloat(l.cost.totalAmount.amount)), 0);
  const totalQuantity = localCart.lines.reduce((acc, l) => acc + l.quantity, 0);

  // Create a fresh object for the cart to ensure reactivity
  localCart = {
    ...localCart,
    lines: [...localCart.lines],
    cost: {
      ...localCart.cost,
      subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: 'EUR' },
      totalAmount: { amount: subtotal.toFixed(2), currencyCode: 'EUR' }
    },
    totalQuantity
  };

  if (!isServer) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(localCart)); } catch (e) {}
  }
}

// ==========================================
// HELPER: SHARED FILTER LOGIC
// ==========================================

function applyFilters(products: Product[], queryObj: any): Product[] {
  let filtered = [...products];
  const query = typeof queryObj === 'string' ? { query: queryObj } : queryObj;
  const qStr = query?.query || "";
  
  // 1. Extract values from query string (both URL params and Shopify format)
  const params = new URLSearchParams(qStr.includes('=') ? qStr : "");
  
  // --- PRICE FILTER ---
  const min = params.get('minPrice') || qStr.match(/variants\.price:>=([\d.]+)/)?.[1];
  const max = params.get('maxPrice') || qStr.match(/variants\.price:<=([\d.]+)/)?.[1];
  
  if (min && !isNaN(parseFloat(min))) {
    filtered = filtered.filter(p => parseFloat(p.priceRange.minVariantPrice.amount) >= parseFloat(min));
  }
  if (max && !isNaN(parseFloat(max))) {
    filtered = filtered.filter(p => parseFloat(p.priceRange.minVariantPrice.amount) <= parseFloat(max));
  }

  // --- VENDOR (BRAND) FILTER ---
  const vendorMatch = qStr.match(/vendor:"([^"]+)"/) || qStr.match(/vendor:([^ ]+)/);
  const vendor = params.get('b') || (vendorMatch ? vendorMatch[1] : null);
  
  if (vendor) {
    const vTerm = vendor.toLowerCase();
    filtered = filtered.filter(p => p.vendor.toLowerCase() === vTerm || (p as any).vendor.toLowerCase().includes(vTerm));
  }

  // --- TAG FILTER ---
  const tag = params.get('t') || qStr.match(/tag:([^ ]+)/)?.[1];
  if (tag) {
    const tTerm = tag.toLowerCase();
    filtered = filtered.filter(p => p.tags.some(t => t.toLowerCase() === tTerm));
  }

  // --- TEXT SEARCH ---
  // If it has q="...", use that. Otherwise use the whole string MINUS the specialized filters.
  let text = params.get('q');
  if (!text) {
    const qMatch = qStr.match(/q:"([^"]+)"/);
    if (qMatch) {
      text = qMatch[1];
    } else {
      // If it's a non-param string, remove the shopify tokens to get the raw search text
      text = qStr
        .replace(/variants\.price:[<>]=\d+(\.\d+)?/g, "")
        .replace(/vendor:"[^"]+"/g, "")
        .replace(/vendor:[^ ]+/g, "")
        .replace(/tag:[^ ]+/g, "")
        .trim();
    }
  }

  if (text && text.trim().length > 0) {
    const term = text.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term) ||
      (p as any).category?.toLowerCase().includes(term)
    );
  }

  // 4. Apply Sorting
  const sortKey = query?.sortKey;
  const reverse = query?.reverse === true || query?.reverse === 'true';

  if (sortKey === 'PRICE') {
    filtered.sort((a, b) => {
      const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
      const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
      return reverse ? priceB - priceA : priceA - priceB;
    });
  } else if (sortKey === 'TITLE') {
    filtered.sort((a, b) => {
      return reverse ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
    });
  } else if (sortKey === 'CREATED_AT') {
     filtered.sort((a, b) => {
      return reverse ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });
  }

  return filtered;
}

// ==========================================
// API EXPORTS
// ==========================================

export async function shopifyFetch<T>(args: any): Promise<any> { return { status: 200, body: { data: {} } }; }
export async function createCart(): Promise<Cart> { return localCart; }
export async function getCart(id: string): Promise<Cart> { return localCart; }

export async function addToCart(id: string, lines: any[]): Promise<Cart> {
  for (const line of lines) {
    const product = MOCK_PRODUCTS.find(p => p.variants[0].id === line.merchandiseId);
    if (!product) continue;
    const existing = localCart.lines.find(l => l.merchandise.id === line.merchandiseId);
    if (existing) {
      existing.quantity += line.quantity;
      existing.cost.totalAmount.amount = (existing.quantity * parseFloat(product.priceRange.minVariantPrice.amount)).toFixed(2);
    } else {
      localCart.lines.push({
        id: `line-${Date.now()}-${line.merchandiseId}`,
        quantity: line.quantity,
        merchandise: { id: line.merchandiseId, title: "Normal", product: product, selectedOptions: [] },
        cost: { totalAmount: { amount: (line.quantity * parseFloat(product.priceRange.minVariantPrice.amount)).toFixed(2), currencyCode: 'EUR' } }
      } as any);
    }
  }
  syncCart();
  return { ...localCart };
}

export async function removeFromCart(id: string, ids: string[]) {
  // Use filter to create a new array
  localCart.lines = localCart.lines.filter(l => !ids.includes(l.id));
  syncCart();
  return { ...localCart };
}

export async function updateCart(id: string, lines: any[]) {
  for (const upd of lines) {
    const line = localCart.lines.find(l => l.id === upd.id);
    if (line) {
      line.quantity = upd.quantity;
      line.cost.totalAmount.amount = (line.quantity * parseFloat(line.merchandise.product.priceRange.minVariantPrice.amount)).toFixed(2);
    }
  }
  syncCart();
  return { ...localCart };
}

export async function getCollections(): Promise<Collection[]> {
  const categories = ['Pizzas', 'Pastas', 'Entrantes', 'Postres'];
  return categories.map(cat => ({
    handle: cat.toLowerCase(),
    title: cat,
    path: `/products?c=${cat.toLowerCase()}`,
    image: MOCK_PRODUCTS.find(p => (p as any).category === cat)?.featuredImage || MOCK_PRODUCTS[0].featuredImage,
    updatedAt: new Date().toISOString(),
    description: `Los mejores ${cat.toLowerCase()} de La Piazza`,
    seo: { title: cat, description: cat } as any,
    products: { edges: MOCK_PRODUCTS.filter(p => (p as any).category === cat).map(p => ({ node: p })) }
  })) as any;
}

export async function getCollectionProducts(args: any) {
  const collection = args?.collection || '';
  let products = [...MOCK_PRODUCTS];
  
  if (collection && collection !== 'all' && collection !== 'hidden-homepage-carousel' && collection !== 'featured-products') {
    products = products.filter(p => (p as any).category.toLowerCase() === collection.toLowerCase());
  }

  // Create combined query object for applyFilters
  const queryObj = {
    query: args?.query?.query || args?.query || "",
    sortKey: args?.sortKey,
    reverse: args?.reverse
  };

  // Apply filters and sorting
  products = applyFilters(products, queryObj);

  if (collection === 'hidden-homepage-carousel') products = MOCK_PRODUCTS.slice(0, 3);
  if (collection === 'featured-products') products = MOCK_PRODUCTS.slice(3, 8);

  return { pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: '' }, products };
}

export async function getProducts(queryObj: any = {}) {
  let products = applyFilters(MOCK_PRODUCTS, queryObj);
  return { pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: '' }, products };
}

export async function getProduct(h: string) { return MOCK_PRODUCTS.find(p => p.handle === h); }
export async function getMenu(h: string) { return [{ title: "Inicio", path: "/" }, { title: "Pizzas", path: "/products?c=pizzas" }, { title: "Carta Completa", path: "/products" }]; }
export async function getHighestProductPrice() { return { amount: "20.0", currencyCode: "EUR" }; }
export async function getVendors(args: any) { return [{ vendor: 'La Piazza', productCount: MOCK_PRODUCTS.length }]; }

// ==========================================
// MOCK USER AUTH
// ==========================================

const MOCK_USER = {
  id: 'user-1',
  firstName: 'Pizzero',
  lastName: 'Expert',
  email: 'alumno@lapiazza.com',
  acceptsMarketing: true
};

export async function createCustomer(i: any) { 
    return { customer: { ...MOCK_USER, email: i.email, firstName: i.firstName }, customerCreateErrors: [] }; 
}

export async function getCustomerAccessToken(i: any) { 
    return { token: "dummy-session-token", customerLoginErrors: [] }; 
}

export async function getUserDetails(t: any) { 
    return { customer: MOCK_USER }; 
}

// Unused stubs
export async function getCollection(h: string) { 
  const products = MOCK_PRODUCTS.filter(p => (p as any).category.toLowerCase() === h.toLowerCase());
  return {
    handle: h,
    title: h.charAt(0).toUpperCase() + h.slice(1),
    products: { edges: products.map(p => ({ node: p })) }
  };
}
export async function getProductRecommendations(id: string) { return MOCK_PRODUCTS.slice(0, 4); }
export async function getPages() { return []; }
export async function getPage(h: string) { return null; }
export async function getTags(args: any) { 
  return [...new Set(MOCK_PRODUCTS.flatMap(p => p.tags))];
}
