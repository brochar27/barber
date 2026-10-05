import Link from "next/link";
import { menu } from "@/lib/menu";
import { VisitForm } from "@/app/visit-form";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const hours = [
  ["Tuesday – Friday", "10–7"],
  ["Saturday", "9–5"],
  ["Sunday – Monday", "Closed"],
];

export default function Home() {
  return (
    <div>
      <div className="h-1.5 bg-red-900" />
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Barber
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a href="#menu">Menu</a>
          <a href="#hours">Hours</a>
          <a href="#book">Book</a>
          <Link href="/book" className="text-stone-500">
            Shop desk
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-end px-5 pb-16">
          <p className="text-xs tracking-[0.22em] text-stone-500 uppercase">
            One chair
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-6xl leading-[0.9] tracking-tight sm:text-8xl">
            Sit down.
            <br />
            Leave sharp.
          </h1>
          <p className="mt-6 max-w-md text-lg text-stone-600">
            Cuts and beard work. Pick a service, pick a time, and the chair is
            yours.
          </p>
          <a
            href="#book"
            className="mt-8 inline-flex w-fit rounded-lg bg-stone-900 px-4 py-3 text-sm text-white"
          >
            Book a time
          </a>
        </section>

        <section id="menu" className="bg-stone-950 text-stone-100">
          <div className="mx-auto w-full max-w-6xl px-5 py-20">
            <h2 className="font-display text-5xl tracking-tight">Menu</h2>
            <ul className="mt-10 max-w-xl">
              {menu.map((item) => (
                <li
                  key={item.service}
                  className="flex items-baseline gap-4 border-b border-stone-800 py-5"
                >
                  <span className="font-display text-3xl">{item.label}</span>
                  <span className="mb-1 flex-1 border-b border-dotted border-stone-700" />
                  <span className="text-stone-300">
                    {money.format(item.cents / 100)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-16 px-5 py-20 lg:grid-cols-2">
          <div id="hours">
            <h2 className="font-display text-5xl tracking-tight">Hours</h2>
            <dl className="mt-8 max-w-sm">
              {hours.map(([day, time]) => (
                <div
                  key={day}
                  className="flex justify-between border-b border-stone-300 py-3 text-sm"
                >
                  <dt>{day}</dt>
                  <dd className="text-stone-500">{time}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="book">
            <h2 className="font-display text-5xl tracking-tight">Book</h2>
            <p className="mt-3 mb-6 max-w-sm text-stone-600">
              Same number next time and it stays on your chair.
            </p>
            <VisitForm />
          </div>
        </section>
      </main>
    </div>
  );
}
