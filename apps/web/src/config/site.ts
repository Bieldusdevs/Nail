import type { NailProfessional, NailService } from "@/types/booking";

export const siteConfig = {
  name: "Lume Atelier",
  shortName: "Lume",
  description: "Nail artistry, cuidado e expressão em Almada.",
  address: "Rua Cândido dos Reis 42, Almada",
  email: "ola@lumeatelier.pt",
  phone: "+351 212 000 420",
  instagram: "@lume.atelier",
} as const;

export const nailServices: NailService[] = [
  {
    id: "b6712d0d-2104-4ab0-a851-878667a0ee01",
    slug: "manicure-signature",
    name: "Manicure Signature",
    description:
      "Preparação cuidada, verniz gel e acabamento de alta precisão.",
    durationMinutes: 60,
    priceCents: 3200,
    accent: "mint",
  },
  {
    id: "b6712d0d-2104-4ab0-a851-878667a0ee02",
    slug: "gel-natural",
    name: "Gel Natural",
    description: "Estrutura leve e resistente, desenhada à medida da tua unha.",
    durationMinutes: 90,
    priceCents: 4400,
    accent: "blue",
  },
  {
    id: "b6712d0d-2104-4ab0-a851-878667a0ee03",
    slug: "nail-art-editorial",
    name: "Nail Art Editorial",
    description:
      "Composição personalizada com detalhe artístico à tua escolha.",
    durationMinutes: 105,
    priceCents: 5200,
    accent: "pink",
  },
  {
    id: "b6712d0d-2104-4ab0-a851-878667a0ee04",
    slug: "ritual-maos",
    name: "Ritual de Mãos",
    description: "Tratamento restaurador, massagem e manicure sem cor.",
    durationMinutes: 45,
    priceCents: 2800,
    accent: "navy",
  },
];

export const nailProfessionals: NailProfessional[] = [
  {
    id: "any",
    name: "Qualquer artista",
    specialty: "Primeira disponibilidade",
    initials: "◎",
  },
  {
    id: "a7712d0d-2104-4ab0-a851-878667a0aa01",
    name: "Inês Martins",
    specialty: "Minimal & gel natural",
    initials: "IM",
  },
  {
    id: "a7712d0d-2104-4ab0-a851-878667a0aa02",
    name: "Marta Lobo",
    specialty: "Nail art & chrome",
    initials: "ML",
  },
  {
    id: "a7712d0d-2104-4ab0-a851-878667a0aa03",
    name: "Leonor Reis",
    specialty: "Care & soft gel",
    initials: "LR",
  },
];
