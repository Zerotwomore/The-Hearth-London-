/**
 * On GitHub Pages the app is served from /<repo>/. next/link and next/image
 * apply basePath themselves, but plain <img> tags do not — so root-relative
 * asset paths have to be prefixed by hand.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}
