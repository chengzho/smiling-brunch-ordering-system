/**
 * Converts an API-returned image path like /images/foo.jpg into a
 * BASE_URL-relative path so it works under any Vite base (dev or XAMPP).
 *
 * Examples with BASE_URL = "/restaurant-ordering/":
 *   /images/toast-club.jpg  →  /restaurant-ordering/images/toast-club.jpg
 *   https://cdn.example.com/img.jpg  →  (unchanged)
 *   (empty string)  →  (unchanged)
 */
export function resolveAssetUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('/images/')) {
    return `${import.meta.env.BASE_URL}images/${url.slice(8)}`;
  }
  return url;
}
