export const menu = [
  { service: "haircut", label: "Haircut", cents: 3500 },
  { service: "beard", label: "Beard", cents: 2500 },
  { service: "haircut + beard", label: "Haircut + beard", cents: 5000 },
  { service: "kids cut", label: "Kids cut", cents: 2500 },
] as const;

export function priceFor(service: string) {
  return menu.find((item) => item.service === service)?.cents ?? null;
}
