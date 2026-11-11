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
    body: "Browse upcoming gatherings across London — each shows its date, venue, area, price and places left.",
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

// Server-rendered (and built to plain HTML) so search engines and AI
// assistants read the content without running any JavaScript.
export default async function HomePage() {
  const events = await getUpcomingEvents(12);
  const jsonLd = JSON.stringify(homeJsonLd(events)).replace(/</g, "\\u003c");

  return (
    <main className="mx-auto w-full max-w-[520px] px-6 py-10">
      <MemberRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <header>
        <p className="eyebrow text-hearth-gold">London community</p>
        <h1 className="display mt-3 text-[40px] leading-[1.05] text-hearth-ink">{SITE_NAME}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-hearth-charcoal">
          Meet people in London over gallery tours, reading groups, supper clubs and long walks —
          for people making London home.
        </p>
        <p lang="zh" className="mt-2 text-[15px] leading-relaxed text-hearth-charcoal-soft">
          美术馆导览、读书会、晚餐聚会与城市漫步 —— 为正在把伦敦变成家的人而设。
        </p>
        <div className="mt-6 space-y-3">
          <Link
            href="/signup"
            className="block rounded-pill bg-hearth-ember px-6 py-3.5 text-center text-base font-medium text-hearth-paper hover:bg-hearth-ember-light"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="block rounded-pill border border-hearth-ink/25 px-6 py-3.5 text-center text-base font-medium text-hearth-ink hover:border-hearth-ink/60"
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
                  className="block rounded-card bg-hearth-paper p-4 shadow-card"
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
        <Link
          href="/events"
          className="mt-4 inline-block text-[15px] font-medium text-hearth-ember underline"
        >
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
              className="rounded-pill bg-hearth-cream-dark px-3.5 py-1.5 text-[14px] text-hearth-charcoal"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-hearth-charcoal">
          Join{" "}
          <Link href="/clubs" className="text-hearth-ember underline">
            clubs
          </Link>{" "}
          around shared interests, or host your own event. The whole app works in English and 中文.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="how">
        <h2 id="how" className="display text-2xl text-hearth-ink">
          How {SITE_NAME} works
        </h2>
        <ol className="mt-4 space-y-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="display text-xl text-hearth-gold">{index + 1}</span>
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
              <p className="mt-1 text-[15px] leading-relaxed text-hearth-charcoal">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-hearth-ink/10 pt-6 text-[14px] text-hearth-charcoal-soft">
        <p>
          © {SITE_NAME} · <Link href="/events" className="underline">Events</Link> ·{" "}
          <Link href="/clubs" className="underline">Clubs</Link> ·{" "}
          <Link href="/login" className="underline">Log in</Link>
        </p>
      </footer>
    </main>
  );
}
