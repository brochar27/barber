"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { priceFor } from "@/lib/menu";

export type FormState = { error: string } | { ok: true } | null;

function pgCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const code = error.code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

function dollarsToCents(raw: string) {
  const trimmed = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [dollars, cents = ""] = trimmed.split(".");
  return Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
}

export async function createClient(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !phone) {
    return { error: "Name and phone are required." };
  }

  try {
    await pool.query("INSERT INTO clients (name, phone) VALUES ($1, $2)", [
      name,
      phone,
    ]);
  } catch (error) {
    if (pgCode(error) === "23505") {
      return { error: "That phone number is already saved." };
    }
    throw error;
  }

  revalidatePath("/book");
  return { ok: true };
}

export async function createAppointment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const priceCents = dollarsToCents(String(formData.get("price") ?? ""));
  const status = String(formData.get("status") ?? "booked");

  if (!clientId || !startsAtRaw || !service) {
    return { error: "Client, time, and service are required." };
  }

  if (priceCents === null) {
    return { error: "Price must be a dollar amount, like 35 or 35.00." };
  }

  if (!["booked", "done", "canceled"].includes(status)) {
    return { error: "Pick a valid status." };
  }

  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "That time is not valid." };
  }

  try {
    await pool.query(
      `INSERT INTO appointments (client_id, starts_at, service, price_cents, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [clientId, startsAt.toISOString(), service, priceCents, status],
    );
  } catch (error) {
    if (pgCode(error) === "23503") {
      return { error: "That client no longer exists. Refresh and pick again." };
    }
    throw error;
  }

  revalidatePath("/book");
  return { ok: true };
}

export async function setAppointmentStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (!id || !["booked", "done", "canceled"].includes(status)) return;

  await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [
    status,
    id,
  ]);
  revalidatePath("/book");
}

export async function bookVisit(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const priceCents = priceFor(service);

  if (!name || !phone || !startsAtRaw) {
    return { error: "Name, phone, and time are required." };
  }

  if (priceCents === null) {
    return { error: "Pick a service from the menu." };
  }

  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "That time is not valid." };
  }

  const client = await pool.query<{ id: string }>(
    `INSERT INTO clients (name, phone)
     VALUES ($1, $2)
     ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
     RETURNING id::text`,
    [name, phone],
  );

  await pool.query(
    `INSERT INTO appointments (client_id, starts_at, service, price_cents, status)
     VALUES ($1, $2, $3, $4, 'booked')`,
    [client.rows[0].id, startsAt.toISOString(), service, priceCents],
  );

  revalidatePath("/book");
  return { ok: true };
}
