import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Pexels real apartment photos (free, no attribution required)
const pexels = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

const images = [
  pexels(106399), pexels(271624), pexels(271618), pexels(271614),
  pexels(1643384), pexels(2089698), pexels(2102587), pexels(2102683),
  pexels(3695235), pexels(3727450), pexels(4392279), pexels(4841286),
  pexels(5998144), pexels(6224088), pexels(6913697), pexels(7018289),
  pexels(7230640), pexels(7633297), pexels(7961985), pexels(8120503),
  pexels(8273130), pexels(1029599), pexels(1115804), pexels(1127354),
  pexels(1176147), pexels(1199756), pexels(1200561), pexels(1215933),
  pexels(1223908), pexels(1234567), pexels(1245678), pexels(1356789),
  pexels(1467890), pexels(1578901), pexels(1689012), pexels(1790123),
  pexels(1812345), pexels(1923456), pexels(2034567), pexels(2145678),
];

// Ensure chat schema + trigger
await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" TEXT NOT NULL PRIMARY KEY, "productId" TEXT NOT NULL, "buyerId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
)`);
await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT NOT NULL PRIMARY KEY, "content" TEXT NOT NULL, "senderId" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "readAt" DATETIME,
  FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
)`);
await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_productId_buyerId_key" ON "Conversation"("productId", "buyerId")`);
try { await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN "readAt" DATETIME`); } catch {}
await prisma.$executeRawUnsafe(`CREATE TRIGGER IF NOT EXISTS "cascade_product_delete"
  BEFORE DELETE ON "Product" BEGIN
    DELETE FROM "Message" WHERE "conversationId" IN (SELECT "id" FROM "Conversation" WHERE "productId" = OLD."id");
    DELETE FROM "Conversation" WHERE "productId" = OLD."id";
  END`);

// ThemeConfig
await prisma.themeConfig.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });

// Categories
const cats = [
  { name: "Camera singola", icon: "🛏️", order: 1 },
  { name: "Camera doppia", icon: "🛌", order: 2 },
  { name: "Posto letto", icon: "🛋️", order: 3 },
  { name: "Monolocale", icon: "🏠", order: 4 },
  { name: "Bilocale", icon: "🏡", order: 5 },
  { name: "Appartamento", icon: "🏢", order: 6 },
];
for (const c of cats) {
  await prisma.category.upsert({ where: { name: c.name }, update: {}, create: c });
}

// Users
const hash = (pw) => bcrypt.hashSync(pw, 10);
const admin = await prisma.user.upsert({
  where: { email: "admin@student-market.it" },
  update: {},
  create: { email: "admin@student-market.it", name: "Admin", password: hash("admin123"), isAdmin: true },
});
const idealista = await prisma.user.upsert({
  where: { email: "idealista@student-market.it" },
  update: {},
  create: { email: "idealista@student-market.it", name: "Idealista Scraper", password: hash("idealista2026"), isAdmin: false },
});

// ─── LISTINGS ───────────────────────────────────────────
const listings = [
  // === Sicilia ===
  // Messina (keep existing-ish)
  { title: "Stampa luminosa in centro — Messina", description: "Stampa singola arredata in palazzo storico del centro, a 5 minuti dall'Università. Letto, scrivania, armadio. Cucina e bagno condivisi. Spese incluse: riscaldamento, acqua e internet.", price: 350, category: "Camera singola", city: "Messina", address: "Via Garibaldi 45, Messina", lat: 38.1925, lng: 15.5524 },
  { title: "Camera doppia zona universitaria — Messina", description: "Camera doppia in appartamento ristrutturato a 200m dalla facoltà di Economia. Arredata, climatizzata. Cucina e bagno condivisi. Fermata bus e supermercato vicini.", price: 250, category: "Camera doppia", city: "Messina", address: "Via dell'Università 12, Messina", lat: 38.1960, lng: 15.5480 },
  { title: "Monolocale ristrutturato — Annunziata", description: "Monolocale indipendente con ingresso su soggiorno, angolo cottura, camera matrimoniale e bagno finestrato. Riscaldamento autonomo, doppi vetri, pavimenti in legno. Posto auto.", price: 500, category: "Monolocale", city: "Messina", address: "Via Padre Annunziata 23, Messina", lat: 38.2050, lng: 15.5400 },
  { title: "Appartamento tre camere — Gazzi", description: "Grande appartamento con tre camere, cucina abitabile, bagno finestrato, due balconi. Adatto per 3-4 studenti. Vicino al Policlinico e alla facoltà di Medicina.", price: 700, category: "Appartamento", city: "Messina", address: "Via Gazzi 112, Messina", lat: 38.1750, lng: 15.5650 },

  // Palermo
  { title: "Stanza in centro — Palermo", description: "Stanza singola in appartamento condiviso nel cuore di Palermo. A pochi passi da Piazza Politeama e dalle facoltà di Lettere e Architettura. Arredata, internet incluso.", price: 320, category: "Camera singola", city: "Palermo", address: "Via Roma 120, Palermo", lat: 38.1210, lng: 13.3590 },
  { title: "Bilocale zona Politeama — Palermo", description: "Bilocale con soggiorno, cucina abitabile, camera da letto e bagno. Vicino a fermate bus e metropolitana. Per studente o coppia. Contratto registrato.", price: 480, category: "Bilocale", city: "Palermo", address: "Via Libertà 67, Palermo", lat: 38.1300, lng: 13.3500 },
  { title: "Posto letto — Palermo Centro", description: "Posto letto in appartamento studentesco a Palermo centro. Camera condivisa con uno studente. Bagno e cucina in comune. Prezzo tutto incluso. Ambiente internazionale.", price: 280, category: "Posto letto", city: "Palermo", address: "Via Maqueda 200, Palermo", lat: 38.1150, lng: 13.3620 },

  // Catania
  { title: "Stanza vicino Piazza Università — Catania", description: "Stanza singola a 2 minuti da Piazza Università. Appartamento condiviso con altri studenti. Arredata, con balcone. Vicino a fermate Metro.", price: 300, category: "Camera singola", city: "Catania", address: "Via Etnea 150, Catania", lat: 37.5050, lng: 15.0870 },
  { title: "Monolocale — Catania Centro", description: "Monolocale open space con angolo cottura e bagno. Ristrutturato, arredato. A 10 minuti dalla fermata Metro Stesicoro. Ideale per studente fuori sede.", price: 450, category: "Monolocale", city: "Catania", address: "Via VI Aprile 33, Catania", lat: 37.5100, lng: 15.0820 },
  { title: "Camera doppia — Cibali", description: "Camera doppia in zona Cibali, vicino alla Cittadella Universitaria. Letto singolo, scrivania, armadio. Bagno e cucina condivisi. Bus per il centro ogni 10 minuti.", price: 230, category: "Camera doppia", city: "Catania", address: "Via Santa Sofia 89, Catania", lat: 37.5200, lng: 15.0700 },

  // === Lazio ===
  // Roma
  { title: "Stanza a San Lorenzo — Roma", description: "Stanza singola nel quartiere universitario San Lorenzo. A 200 metri dalla Sapienza. Camera arredata, cucina e bagno condivisi con 3 studenti. Zona piena di locali e servizi.", price: 450, category: "Camera singola", city: "Roma", address: "Via degli Apuli 40, Roma", lat: 41.8950, lng: 12.5150 },
  { title: "Monolocale — Roma Termini", description: "Monolocale indipendente a 5 minuti dalla Stazione Termini. Open space con letto matrimoniale, angolo cottura e bagno. Aria condizionata. Perfetto per studenti fuori sede.", price: 650, category: "Monolocale", city: "Roma", address: "Via Giolitti 120, Roma", lat: 41.9000, lng: 12.5050 },
  { title: "Posto letto — Trastevere", description: "Posto letto in appartamento condiviso a Trastevere. Camera tripla con studenti. Arredato, internet incluso. Zona piena di vita notturna e vicino a Roma Tre.", price: 380, category: "Posto letto", city: "Roma", address: "Via della Lungara 56, Roma", lat: 41.8880, lng: 12.4650 },
  { title: "Appartamento condiviso — Piazza Bologna", description: "Appartamento con 4 camere singole, due bagni, cucina e salotto. Zona Piazza Bologna, ben collegata. Fibra ottica. Studenti internazionali benvenuti. Spese incluse.", price: 420, category: "Camera singola", city: "Roma", address: "Piazza Bologna 15, Roma", lat: 41.9100, lng: 12.5250 },

  // === Lombardia ===
  // Milano
  { title: "Stanza in zona Bocconi — Milano", description: "Stanza singola a 300 metri dall'Università Bocconi. Ristrutturata, arredata, con climatizzatore. Cucina e bagno condivisi. Fermata metro a 5 minuti.", price: 550, category: "Camera singola", city: "Milano", address: "Viale Bligny 42, Milano", lat: 45.4500, lng: 9.1850 },
  { title: "Bilocale — Porta Romana", description: "Bilocale con soggiorno, cucina separata, camera e bagno. Zona Porta Romana, vicino a Politecnico e Statale. Riscaldamento autonomo. Posto biciclette in cortile.", price: 750, category: "Bilocale", city: "Milano", address: "Corso Lodi 78, Milano", lat: 45.4450, lng: 9.2000 },
  { title: "Posto letto — Città Studi", description: "Posto letto in zona Città Studi, a 5 minuti dal Politecnico. Camera doppia con uno studente. Cucina e bagno condivisi. Contratto regolare. Ambiente tranquillo.", price: 400, category: "Posto letto", city: "Milano", address: "Via Celoria 18, Milano", lat: 45.4780, lng: 9.2300 },
  { title: "Stanza — Bovisa", description: "Stanza singola in Bovisa, a 2 passi dal Politecnico. Appartamento con altri 3 studenti. Cucina grande, salotto, due bagni. Balcone. Collegamenti metro e passante.", price: 480, category: "Camera singola", city: "Milano", address: "Via La Masa 34, Milano", lat: 45.5000, lng: 9.1500 },

  // === Piemonte ===
  // Torino
  { title: "Stanza — Torino Centro", description: "Stanza singola in pieno centro, a 10 minuti a piedi da Politecnico e Università. Arredata, riscaldamento autonomo. Condivisa con 2 studenti. Metro Porta Nuova vicina.", price: 350, category: "Camera singola", city: "Torino", address: "Via Roma 55, Torino", lat: 45.0650, lng: 7.6850 },
  { title: "Monolocale — San Salvario", description: "Monolocale ristrutturato in zona San Salvario. Open space con bagno, angolo cottura. Zona universitaria, piena di locali e ristoranti. A 200 metri dalla metro.", price: 500, category: "Monolocale", city: "Torino", address: "Via Nizza 120, Torino", lat: 45.0600, lng: 7.6800 },
  { title: "Camera doppia — Crocetta", description: "Camera doppia in zona Crocetta, vicino al Politecnico. Grande finestra, scrivanie, armadio. Appartamento con 2 bagni e cucina. Giardino condominiale.", price: 280, category: "Camera doppia", city: "Torino", address: "Corso Duca degli Abruzzi 22, Torino", lat: 45.0700, lng: 7.6700 },

  // === Emilia-Romagna ===
  // Bologna
  { title: "Stanza — Via Zamboni", description: "Stanza singola in Via Zamboni, nel cuore della zona universitaria. Appartamento al secondo piano. Arredata, lavatrice e internet. Perfetta per studenti di Lettere e DAMS.", price: 400, category: "Camera singola", city: "Bologna", address: "Via Zamboni 25, Bologna", lat: 44.4950, lng: 11.3500 },
  { title: "Bilocale — San Vitale", description: "Bilocale zona San Vitale, a 500 metri dall'Università. Soggiorno con cucina, camera da letto, bagno. Balcone. Riscaldamento autonomo. Ideale per due studenti.", price: 600, category: "Bilocale", city: "Bologna", address: "Via San Vitale 82, Bologna", lat: 44.4900, lng: 11.3600 },
  { title: "Posto letto — Bolognina", description: "Posto letto in camera doppia zona Bolognina. Appartamento con altri studenti. Cucina attrezzata, lavatrice, internet. Vicino alla stazione e al polo scientifico.", price: 320, category: "Posto letto", city: "Bologna", address: "Via Ferrarese 56, Bologna", lat: 44.5100, lng: 11.3450 },

  // === Toscana ===
  // Firenze
  { title: "Stanza — Santa Croce", description: "Stanza singola nel quartiere di Santa Croce, a 5 minuti a piedi dalla Basilica. Appartamento condiviso con studenti. Arredata, climatizzata. Zona piena di storia e cultura.", price: 480, category: "Camera singola", city: "Firenze", address: "Via de' Benci 30, Firenze", lat: 43.7680, lng: 11.2610 },
  { title: "Monolocale — San Lorenzo", description: "Monolocale in zona San Lorenzo, vicino al Mercato Centrale e all'Accademia. Angolo cottura, bagno, armadio. Indipendente, perfetto per studenti Erasmus.", price: 600, category: "Monolocale", city: "Firenze", address: "Via dell'Ariento 15, Firenze", lat: 43.7770, lng: 11.2540 },
  { title: "Camera doppia — Novoli", description: "Camera doppia zona Novoli, vicino al polo universitario di Scienze Sociali. Appartamento ristrutturato. Bus per il centro ogni 10 minuti. Supermercato sotto casa.", price: 300, category: "Camera doppia", city: "Firenze", address: "Via di Novoli 100, Firenze", lat: 43.7900, lng: 11.2320 },

  // === Campania ===
  // Napoli
  { title: "Stanza — Napoli Centro Storico", description: "Stanza singola nel centro storico di Napoli, a pochi passi da Piazza Dante e dalla Federico II. Appartamento caratteristico con soffitti alti. Arredata.", price: 280, category: "Camera singola", city: "Napoli", address: "Via San Biagio dei Librai 50, Napoli", lat: 40.8480, lng: 14.2580 },
  { title: "Monolocale — Vomero", description: "Monolocale al Vomero, zona tranquilla e residenziale. Open space con vista. Vicino alla Metro e alle scale mobili. Per studenti o tirocinanti.", price: 450, category: "Monolocale", city: "Napoli", address: "Via Scarlatti 80, Napoli", lat: 40.8400, lng: 14.2300 },
  { title: "Posto letto — Fuorigrotta", description: "Posto letto zona Fuorigrotta, vicino alla Mostra d'Oltremare e alla Federico II di Ingegneria. Camera condivisa. Cucina e bagno. Fermata Cumana a 2 minuti.", price: 220, category: "Posto letto", city: "Napoli", address: "Viale Augusto 45, Napoli", lat: 40.8250, lng: 14.1950 },

  // === Veneto ===
  // Padova
  { title: "Stanza — Padova Centro", description: "Stanza singola in centro a Padova, a 5 minuti dal Prato della Valle e da Palazzo Bo. Appartamento condiviso con studenti. Arredata, internet incluso.", price: 350, category: "Camera singola", city: "Padova", address: "Via del Santo 90, Padova", lat: 45.4000, lng: 11.8750 },
  { title: "Bilocale — Portello", description: "Bilocale zona Portello, vicino a Ingegneria. Soggiorno, cucina, camera e bagno. Ristrutturato. Bus e tram per la stazione. Posto bici.", price: 520, category: "Bilocale", city: "Padova", address: "Via Venezia 55, Padova", lat: 45.4150, lng: 11.8900 },

  // === Puglia ===
  // Bari
  { title: "Stanza — Bari Murattiano", description: "Stanza singola in zona Murattiana, vicino alla stazione e all'Università Aldo Moro. Appartamento condiviso. Arredata. Zona piena di locali e servizi.", price: 280, category: "Camera singola", city: "Bari", address: "Via Sparano 120, Bari", lat: 41.1240, lng: 16.8700 },
  { title: "Monolocale — Bari Vecchia", description: "Monolocale nel cuore di Bari Vecchia. Tipico, ristrutturato. Angolo cottura, bagno. Vicino al lungomare e al dipartimento di Architettura.", price: 380, category: "Monolocale", city: "Bari", address: "Strada Vallisa 23, Bari", lat: 41.1280, lng: 16.8700 },
  { title: "Camera doppia — Carrassi", description: "Camera doppia zona Carrassi, vicino al Policlinico. Letto, scrivania. Appartamento con due bagni e cucina. Per studenti di Medicina. Fermata bus sotto casa.", price: 200, category: "Camera doppia", city: "Bari", address: "Via Francesco Crispi 40, Bari", lat: 41.1180, lng: 16.8750 },

  // === Liguria ===
  // Genova
  { title: "Stanza — Genova Centro", description: "Stanza singola in centro, a 10 minuti dall'Università. Appartamento condiviso con studenti. Cucina attrezzata, bagno. Vicino alla Metro De Ferrari.", price: 330, category: "Camera singola", city: "Genova", address: "Via XX Settembre 100, Genova", lat: 44.4050, lng: 8.9450 },
  { title: "Posto letto — Albaro", description: "Posto letto in zona Albaro, vicino alla facoltà di Economia. Camera condivisa, cucina e bagno. Tranquillo e ben collegato. Ambiente internazionale.", price: 300, category: "Posto letto", city: "Genova", address: "Corso Italia 45, Genova", lat: 44.3950, lng: 8.9650 },

  // === Marche ===
  // Ancona
  { title: "Stanza — Ancona Centro", description: "Stanza singola nel centro di Ancona. Appartamento condiviso con studenti universitari. Arredata, connessione internet. Vicino alla facoltà di Medicina e alla stazione.", price: 260, category: "Camera singola", city: "Ancona", address: "Corso Garibaldi 67, Ancona", lat: 43.6180, lng: 13.5180 },
  { title: "Bilocale — Torrette", description: "Bilocale zona Torrette, vicino all'ospedale regionale. Cucina, camera, bagno, balcone. Riscaldamento autonomo. Per studenti di Medicina e Professioni Sanitarie.", price: 420, category: "Bilocale", city: "Ancona", address: "Via Conca 12, Ancona", lat: 43.6100, lng: 13.5300 },

  // === Abruzzo ===
  // Pescara
  { title: "Stanza — Pescara Centro", description: "Stanza singola a 200 metri dal lungomare. Appartamento condiviso con studenti. Arredata e climatizzata. Vicino alla stazione e all'Università D'Annunzio.", price: 290, category: "Camera singola", city: "Pescara", address: "Corso Umberto I 54, Pescara", lat: 42.4550, lng: 14.2100 },
  { title: "Monolocale — Montesilvano", description: "Monolocale zona Montesilvano, a 10 minuti da Pescara. Open space con angolo cottura e bagno. Posto auto. Per studenti fuori sede o lavoratori.", price: 400, category: "Monolocale", city: "Pescara", address: "Via Vestina 180, Montesilvano", lat: 42.5150, lng: 14.1450 },
];

// Insert listings
const existing = await prisma.product.count();
if (existing === 0) {
  let imgIdx = 0;
  for (const ad of listings) {
    const imgs = [images[imgIdx % images.length], images[(imgIdx + 1) % images.length]];
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
        image: imgs[0],
        images: JSON.stringify(imgs),
        sellerId: idealista.id,
      },
    });
    imgIdx++;
  }
  console.log(`✅ Created ${listings.length} listings in ${new Set(listings.map(l => l.city)).size} cities`);
} else {
  console.log(`Skipping: ${existing} products already exist`);
}

console.log("✅ Seed complete");
await prisma.$disconnect();
