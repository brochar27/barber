"use client";

import { useActionState, useEffect, useRef } from "react";
import { bookVisit, type FormState } from "@/app/actions";
import { menu } from "@/lib/menu";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-stone-900";

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  if ("error" in state) {
    return <p className="text-sm text-red-800">{state.error}</p>;
  }
  return <p className="text-sm text-stone-700">You're on the book.</p>;
}

export function VisitForm() {
  const [state, action, pending] = useActionState(bookVisit, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "ok" in state) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs tracking-wide text-stone-500 uppercase">
          Name
        </span>
        <input name="name" required className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs tracking-wide text-stone-500 uppercase">
          Phone
        </span>
        <input name="phone" required className={inputClass} />
      </label>
      <fieldset>
        <legend className="mb-1.5 text-xs tracking-wide text-stone-500 uppercase">
          Service
        </legend>
        <div className="grid gap-2">
          {menu.map((item) => (
            <label
              key={item.service}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm has-checked:border-stone-900"
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="service"
                  value={item.service}
                  required
                  className="accent-stone-900"
                />
                {item.label}
              </span>
              <span className="text-stone-500">{money.format(item.cents / 100)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="mb-1.5 block text-xs tracking-wide text-stone-500 uppercase">
          When
        </span>
        <input
          name="startsAt"
          type="datetime-local"
          required
          className={inputClass}
        />
      </label>
      <Status state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-stone-900 px-3 py-3 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Booking…" : "Book the chair"}
      </button>
    </form>
  );
}
