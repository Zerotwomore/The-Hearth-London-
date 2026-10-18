// Links to individual events, clubs and chats.
//
// The site is a static export (GitHub Pages), which can't build a page for
// an event created after the last deploy. So each kind has one page that
// reads the id from the query string. Moving to a server host later only
// means changing these three functions.

export function eventHref(id: string): string {
  return `/events/view?id=${encodeURIComponent(id)}`;
}

export function clubHref(id: string): string {
  return `/clubs/view?id=${encodeURIComponent(id)}`;
}

export function chatHref(id: string): string {
  return `/chat/view?id=${encodeURIComponent(id)}`;
}

/** The log-in page, returning to `path` (a same-site path) afterwards. */
export function loginHref(path: string): string {
  return `/login?next=${encodeURIComponent(path)}`;
}
