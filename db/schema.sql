-- One barber, many clients, each client has appointments.
-- price is cents so $35.00 is stored as 3500. Avoids float rounding.

CREATE TABLE clients (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id bigint NOT NULL REFERENCES clients (id),
  starts_at timestamptz NOT NULL,
  service text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'done', 'canceled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO clients (name, phone)
VALUES ('Alex Rivera', '4155550101');

INSERT INTO appointments (client_id, starts_at, service, price_cents)
VALUES (1, '2026-10-04 10:00-07', 'haircut', 3500);
