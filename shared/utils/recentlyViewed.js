import { storage } from "./storage";

const KEY = "recentlyViewed";
const MAX = 10;

const PICK_FIELDS = [
  "_id", "id", "name", "images", "price", "discountPrice",
  "discountPercent", "badge", "hasVariants", "skus", "stock", "category",
];

function pick(product) {
  const out = {};
  PICK_FIELDS.forEach((f) => {
    if (product[f] !== undefined) out[f] = product[f];
  });
  return out;
}

export async function addLocalRecentlyViewed(product) {
  try {
    const raw = await storage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    const id = product._id || product.id;
    const filtered = list.filter((p) => (p._id || p.id) !== id);
    const updated = [pick(product), ...filtered].slice(0, MAX);
    await storage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function getLocalRecentlyViewed() {
  try {
    const raw = await storage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
