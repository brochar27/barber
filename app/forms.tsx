"use client";

import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createAppointment,
  createClient,
  type FormState,
} from "@/app/actions";

const services = ["haircut", "beard", "haircut + beard", "kids cut"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-stone-500 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900";

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  if ("error" in state) {
    return <p className="text-sm text-red-800">{state.error}</p>;
  }
  return <p className="text-sm text-stone-600">Saved.</p>;
}

export function ClientForm({ onSaved }: { onSaved?: () => void }) {
  const [state, action, pending] = useActionState(createClient, null);
  const formRef = useRef<HTMLFormElement>(null);

  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    if (state && "ok" in state) {
      formRef.current?.reset();
      onSavedRef.current?.();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <Field label="Name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" required className={inputClass} />
      </Field>
      <Status state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-stone-900 px-3 py-2.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add client"}
      </button>
    </form>
  );
}

export function AppointmentForm({
  clients,
  onSaved,
}: {
  clients: { id: string; name: string }[];
  onSaved?: () => void;
}) {
  const [state, action, pending] = useActionState(createAppointment, null);
  const formRef = useRef<HTMLFormElement>(null);

  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    if (state && "ok" in state) {
      formRef.current?.reset();
      onSavedRef.current?.();
    }
  }, [state]);

  if (clients.length === 0) {
    return <p className="text-sm text-stone-600">Add a client first.</p>;
  }

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <Field label="Client">
        <select name="clientId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="When">
        <input
          name="startsAt"
          type="datetime-local"
          required
          className={inputClass}
        />
      </Field>
      <Field label="Service">
        <input
          name="service"
          required
          className={inputClass}
          placeholder="haircut"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {services.map((service) => (
            <button
              key={service}
              type="button"
              className="rounded-full border border-stone-300 px-2.5 py-1 text-xs text-stone-700"
              onClick={() => {
                const input = formRef.current?.elements.namedItem("service");
                if (input instanceof HTMLInputElement) input.value = service;
              }}
            >
              {service}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Price">
        <input
          name="price"
          inputMode="decimal"
          required
          placeholder="35"
          className={inputClass}
        />
      </Field>
      <input type="hidden" name="status" value="booked" />
      <Status state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-stone-900 px-3 py-2.5 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Book it"}
      </button>
    </form>
  );
}

function Dialog({
  label,
  title,
  tone = "dark",
  children,
}: {
  label: string;
  title: string;
  tone?: "dark" | "light";
  children: (close: () => void) => ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [ticket, setTicket] = useState(0);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, ticket]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTicket((value) => value + 1);
          setOpen(true);
        }}
        className={
          tone === "dark"
            ? "rounded-lg bg-stone-900 px-3 py-2 text-sm text-white"
            : "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        }
      >
        {label}
      </button>
      <dialog
        ref={ref}
        className="shadow-xl"
        onClose={() => setOpen(false)}
      >
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl">{title}</h2>
            <form method="dialog">
              <button type="submit" className="text-sm text-stone-500">
                Close
              </button>
            </form>
          </div>
          <div key={ticket}>{children(() => setOpen(false))}</div>
        </div>
      </dialog>
    </>
  );
}

export function BookButton({
  clients,
}: {
  clients: { id: string; name: string }[];
}) {
  return (
    <Dialog label="Book" title="New appointment">
      {(close) => <AppointmentForm clients={clients} onSaved={close} />}
    </Dialog>
  );
}

export function ClientButton() {
  return (
    <Dialog label="New client" title="New client" tone="light">
      {(close) => <ClientForm onSaved={close} />}
    </Dialog>
  );
}

export function ClientList({
  clients,
}: {
  clients: { id: string; name: string; phone: string }[];
}) {
  const [query, setQuery] = useState("");
  const shown = clients.filter((client) =>
    `${client.name} ${client.phone}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search clients"
        className={`${inputClass} mb-3`}
      />
      {shown.length === 0 ? (
        <p className="text-sm text-stone-500">No matches.</p>
      ) : (
        <ul className="divide-y divide-stone-200">
          {shown.map((client) => (
            <li key={client.id} className="py-3">
              <div className="font-medium">{client.name}</div>
              <div className="text-sm text-stone-500">{client.phone}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
