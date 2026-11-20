import Link from "next/link";
import { MemberRedirect } from "@/components/home/MemberRedirect";
import {
  CATEGORIES,
  FAQ,
  SITE_NAME,
  formatLondon,
  getUpcomingEvents,
  homeJsonLd,
  priceLabel,
} from "@/lib/seo";

const STEPS = [
  {
    title: "Find something worth leaving the house for",
    body: "Browse upcoming gatherings across London. Each shows its date, venue, area, price and places left.",
  },
  {
    title: "Ask to join",
    body: "Send a request to the host. Once you're accepted you're on the list and in the event's group chat.",
  },
  {
    title: "Meet, then keep in touch",
    body: "Turn up, pay the host at the event if there's a charge, and stay connected through clubs and chat.",
  },
];

/** Soft wash of colour and brush texture behind the page, after the share-preview painting. */
function PainterlyCanvas() {
  return (
    <div className="home-canvas" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="impasto" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.12" numOctaves="4" seed="14" />
          <feColorMatrix type="saturate" values="0.25" />
        </filter>
        <rect width="100%" height="100%" filter="url(#impasto)" />
      </svg>
    </div>
  );
}

// Server-rendered (and built to plain HTML) so search engines and AI
// assistants read the content without running any JavaScript.
export default async function HomePage() {
  const events = await getUpcomingEvents(12);
  const jsonLd = JSON.stringify(homeJsonLd(events)).replace(/</g, "\\u003c");

  return (
    <div className="home-painterly relative flex flex-1 flex-col">
      <PainterlyCanvas />
      <MemberRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <main className="relative z-10 mx-auto my-6 w-full max-w-[520px] px-4 sm:my-10 sm:px-0">
        <div className="sunlit-veil rounded-[28px] px-6 py-9 sm:px-8 sm:py-10">
          <header>
            <p className="eyebrow text-hearth-gold">London community</p>
            <h1 className="display mt-3 text-[40px] leading-[1.05] text-hearth-ink">{SITE_NAME}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-hearth-charcoal">
              Meet people in London over reading groups, cultural exchange salons, philosophy
              discussions and psychology circles, for people making London home.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/signup"
                className="painterly-btn-primary block rounded-pill px-6 py-3.5 text-center text-base font-medium"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="painterly-btn-secondary block rounded-pill px-6 py-3.5 text-center text-base font-medium"
              >
                I already have an account
              </Link>
            </div>
          </header>

          <section className="mt-12" aria-labelledby="whats-on">
            <h2 id="whats-on" className="display text-2xl text-hearth-ink">
              What&apos;s on in London
            </h2>
            {events.length ? (
              <ul className="mt-4 space-y-3">
                {events.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/view/?id=${encodeURIComponent(event.id)}`}
                      className="painterly-card block rounded-2xl p-4"
                    >
                      <p className="eyebrow text-hearth-gold">
                        <time dateTime={event.startsAt}>{formatLondon(event.startsAt)}</time>
                      </p>
                      <h3 className="display mt-1 text-lg text-hearth-ink">{event.title}</h3>
                      <p className="mt-1 text-[14px] text-hearth-charcoal-soft">
                        {event.venue}, {event.area} · {priceLabel(event.pricePence)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[15px] text-hearth-charcoal-soft">
                New gatherings are added all the time.
              </p>
            )}
            <Link href="/events" className="painterly-link mt-4 inline-block text-[15px] font-medium">
              See every upcoming event
            </Link>
          </section>

          <section className="mt-12" aria-labelledby="kinds">
            <h2 id="kinds" className="display text-2xl text-hearth-ink">
              What you&apos;ll find at {SITE_NAME}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((name) => (
                <li
                  key={name}
                  className="painterly-pill rounded-pill px-3.5 py-1.5 text-[14px] font-medium text-hearth-charcoal"
                >
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-hearth-charcoal">
              Join{" "}
              <Link href="/clubs" className="painterly-link font-medium">
                clubs
              </Link>{" "}
              around shared interests, or host your own event.
            </p>
          </section>

          <section className="mt-12" aria-labelledby="how">
            <h2 id="how" className="display text-2xl text-hearth-ink">
              How {SITE_NAME} works
            </h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3.5">
                  <span className="display text-xl font-semibold text-hearth-gold">{index + 1}</span>
                  <div>
                    <h3 className="font-semibold text-hearth-ink">{step.title}</h3>
                    <p className="mt-0.5 text-[15px] leading-relaxed text-hearth-charcoal">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12" aria-labelledby="faq">
            <h2 id="faq" className="display text-2xl text-hearth-ink">
              Questions about {SITE_NAME}
            </h2>
            <div className="mt-4 space-y-5">
              {FAQ.map((item) => (
                <div key={item.question}>
                  <h3 className="font-semibold text-hearth-ink">{item.question}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-hearth-charcoal">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-12 border-t border-amber-900/15 pt-6 text-[14px] text-hearth-charcoal-soft">
            <p>
              © {SITE_NAME} ·{" "}
              <Link href="/events" className="painterly-link">
                Events
              </Link>{" "}
              ·{" "}
              <Link href="/clubs" className="painterly-link">
                Clubs
              </Link>{" "}
              ·{" "}
              <Link href="/login" className="painterly-link">
                Log in
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
