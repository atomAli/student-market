import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Find the idealista user
const idealista = await prisma.user.findUnique({ where: { email: "idealista@student-market.it" } });
if (!idealista) {
  console.error("❌ idealista user not found. Run seed.mjs first.");
  process.exit(1);
}

// Real listing data sourced from idealista.it — Messina, under €1000/month
// Images are from idealista's own CDN (img4.idealista.it) — the original listing photos
const listings = [
  {
    title: "Camera singola — Via Cremona, Messina",
    description: "A 100 metri dalla fermata del tram Don Orione, affittiamo camera singola arredata a studentesse o lavoratrici fuori sede. Pavimenti in parquet, balcone sulla strada. Bagno e cucina in condivisione. Riscaldamento autonomo, primo piano con ascensore. Posizione strategica in zona ben servita.",
    price: 280, category: "Camera singola", city: "Messina", address: "Via Cremona 4, Messina",
    lat: 38.1940, lng: 15.5530,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/b7/5f/5e/263371921.jpg",
  },
  {
    title: "Camera per studentessa — Via Felice Bisazza, Centro",
    description: "In centro città, via Felice Bisazza, vicino al Tribunale e all'Università centrale, camera singola per studentessa in appartamento ristrutturato condiviso con altre studentesse. Camera climatizzata, arredata con mobili nuovi. Contesto condominiale signorile. Contratto regolare per studenti fuori sede.",
    price: 300, category: "Camera singola", city: "Messina", address: "Via Felice Bisazza, Messina",
    lat: 38.1910, lng: 15.5560,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/07/a5/58/429914097.jpg",
  },
  {
    title: "Camera singola — Viale Principe Umberto",
    description: "Viale Principe Umberto — Stanze per studenti. Appartamento recentemente ristrutturato, quarto piano con ascensore, a pochi minuti da Piazza Cairoli. Posizione strategica, vicino ai principali mezzi di trasporto. Stanze per studentesse universitarie. Uso transitorio. Tutto incluso.",
    price: 320, category: "Camera singola", city: "Messina", address: "Viale Principe Umberto 49, Messina",
    lat: 38.1890, lng: 15.5550,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/1d/ed/a6/633756686.jpg",
  },
  {
    title: "Stanza per studente — Via II Condottieri, Gazzi",
    description: "In via II Condottieri, zona ben servita dai mezzi pubblici, vicino al Policlinico universitario e all'uscita autostradale di Gazzi. Camera singola in appartamento composto da tre camere, cucina, bagno e balcone. Appartamento in buone condizioni. Ideale per studenti universitari.",
    price: 260, category: "Camera singola", city: "Messina", address: "Via II Condottieri 11, Messina",
    lat: 38.1930, lng: 15.5430,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/5f/29/ce/679585237.jpg",
  },
  {
    title: "Camera — Via La Farina, Policlinico",
    description: "Vicino al Policlinico Universitario Gaetano Martino, camera singola climatizzata per referenziato/a. Appartamento composto da tre camere più servizi. Affitto: €250/mese + Tari. Zona Provinciale, ben collegata. Contratto 1 anno, rinnovabile. Disponibile da subito.",
    price: 250, category: "Camera singola", city: "Messina", address: "Via Giuseppe La Farina 199, Messina",
    lat: 38.1860, lng: 15.5580,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/99/7e/4d/608717611.jpg",
  },
  {
    title: "Camera doppia — Via Canova, Giostra",
    description: "Due camere per studenti in zona tranquilla e ben collegata di Via Canova. Perfette per studenti universitari che cercano un ambiente confortevole e funzionale. Appartamento completamente arredato. Disponibile per l'anno accademico. Contratto regolare.",
    price: 220, category: "Camera doppia", city: "Messina", address: "Via Antonio Canova 110, Giostra, Messina",
    lat: 38.2000, lng: 15.5400,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/54/43/c0/514841061.jpg",
  },
  {
    title: "Camera singola — Via degli Orti, Sant'Antonio",
    description: "Per studentesse. Disponibile da metà luglio. Camera singola in appartamento ristrutturato al terzo piano senza ascensore. Appartamento composto da 4 camere, cucina, bagno, ripostiglio e posto auto scoperto. Riscaldamento autonomo. Completamente ristrutturato. Vicino a Sant'Antonio e al Cannizzaro.",
    price: 290, category: "Camera singola", city: "Messina", address: "Via degli Orti 19, Messina",
    lat: 38.1880, lng: 15.5600,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/29/e7/0a/687020738.jpg",
  },
  {
    title: "Monolocale — Residence Campus, Sperone",
    description: "Affittasi uso transitorio. Monolocale arredato presso Residence Campus a Sperone, nei pressi dell'Ospedale Papardo. Composto da unico ambiente con angolo cottura, bagno e piccolo spazio esterno. Per impiegati, studenti e specializzandi. Posizione tranquilla e ben collegata.",
    price: 380, category: "Monolocale", city: "Messina", address: "Via Comunale Sperone, Residence Campus, Messina",
    lat: 38.2200, lng: 15.5300,
    image: "https://img4.idealista.it/blur/480_360_mq/0/id.pro.it.image.master/54/43/c0/514841061.jpg",
  },
];

// Remove old idealista listings and add new ones
await prisma.product.deleteMany({ where: { sellerId: idealista.id } });

let idx = 0;
for (const ad of listings) {
  await prisma.product.create({
    data: {
      title: ad.title,
      description: ad.description,
      price: ad.price,
      category: ad.category,
      city: ad.city,
      address: ad.address,
      latitude: ad.lat,
      longitude: ad.lng,
      image: ad.image,
      images: JSON.stringify([ad.image]),
      sellerId: idealista.id,
    },
  });
  idx++;
}

console.log(`✅ Created ${idx} listings from idealista data`);
await prisma.$disconnect();
