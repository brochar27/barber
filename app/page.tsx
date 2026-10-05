import Link from "next/link";
import { pool } from "@/lib/db";
import { setAppointmentStatus } from "@/app/actions";
import { BookButton, ClientButton, ClientList } from "@/app/forms";

export const dynamic = "force-dynamic";

type ClientRow = { id: string; name: string; phone: string };
type AppointmentRow = {
  id: string;
  name: string;
  phone: string;
  starts_at: Date;
  service: string;
  price_cents: number;
  status: string;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dayLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

const timeLabel = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDay(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const { day: requestedDay } = await searchParams;
  const today = isoDate(new Date());
  const day =
    requestedDay && /^\d{4}-\d{2}-\d{2}$/.test(requestedDay)
      ? requestedDay
      : today;
  const start = new Date(`${day}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [clients, appointments] = await Promise.all([
    pool.query<ClientRow>(
      "SELECT id::text, name, phone FROM clients ORDER BY name",
    ),
    pool.query<AppointmentRow>(
      `SELECT a.id::text, c.name, c.phone, a.starts_at, a.service, a.price_cents, a.status
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       WHERE a.starts_at >= $1 AND a.starts_at < $2
       ORDER BY a.starts_at`,
      [start.toISOString(), end.toISOString()],
    ),
  ]);

  const rows = appointments.rows;
  const booked = rows.filter((row) => row.status === "booked");
  const take = rows
    .filter((row) => row.status !== "canceled")
    .reduce((sum, row) => sum + row.price_cents, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-stone-500 uppercase">
            Shop book
          </p>
          <h1 className="font-display text-5xl leading-none tracking-tight">
            Barber
          </h1>
        </div>
        <div className="flex gap-2">
          <ClientButton />
          <BookButton clients={clients.rows} />
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-medium">{dayLabel.format(start)}</h2>
              <p className="text-sm text-stone-500">
                {rows.length} on the book · {money.format(take / 100)} expected
                {booked.length > 0 ? ` · ${booked.length} still booked` : ""}
              </p>
            </div>
            <nav className="flex gap-1 text-sm">
              <Link
                href={`/?day=${shiftDay(day, -1)}`}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2"
              >
                Previous
              </Link>
              <Link
                href={day === today ? `/?day=${today}` : "/"}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2"
              >
                Today
              </Link>
              <Link
                href={`/?day=${shiftDay(day, 1)}`}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2"
              >
                Next
              </Link>
            </nav>
          </div>

          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-16 text-center text-sm text-stone-500">
              Nobody booked this day.
            </p>
          ) : (
            <ol className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="grid gap-3 border-b border-stone-200 px-4 py-4 last:border-b-0 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center"
                >
                  <time className="text-sm font-medium text-stone-500">
                    {timeLabel.format(row.starts_at)}
                  </time>
                  <div className={row.status === "canceled" ? "opacity-50" : ""}>
                    <div className="font-medium">
                      {row.name}
                      <span className="font-normal text-stone-500">
                        {" "}
                        · {row.service}
                      </span>
                    </div>
                    <div className="text-sm text-stone-500">
                      {row.phone} · {money.format(row.price_cents / 100)} ·{" "}
                      {row.status}
                    </div>
                  </div>
                  <form action={setAppointmentStatus} className="flex gap-1.5">
                    <input type="hidden" name="id" value={row.id} />
                    {row.status !== "done" && (
                      <button
                        name="status"
                        value="done"
                        className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white"
                      >
                        Done
                      </button>
                    )}
                    {row.status !== "canceled" && (
                      <button
                        name="status"
                        value="canceled"
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    {row.status !== "booked" && (
                      <button
                        name="status"
                        value="booked"
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs"
                      >
                        Book again
                      </button>
                    )}
                  </form>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="rounded-2xl border border-stone-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-medium tracking-wide text-stone-500 uppercase">
            Clients
          </h2>
          {clients.rows.length === 0 ? (
            <p className="text-sm text-stone-500">No clients yet.</p>
          ) : (
            <ClientList clients={clients.rows} />
          )}
        </aside>
      </div>
    </main>
  );
}
