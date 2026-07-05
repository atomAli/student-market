import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hashPassword(pw) {
  return bcrypt.hashSync(pw, 10);
}

await prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )
`);

await prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )
`);

await prisma.$executeRawUnsafe(`
  CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_productId_buyerId_key"
  ON "Conversation"("productId", "buyerId")
`);

try {
  await prisma.$executeRawUnsafe(`ALTER TABLE "Message" ADD COLUMN "readAt" DATETIME`);
} catch {}

await prisma.$executeRawUnsafe(`
  CREATE TRIGGER IF NOT EXISTS "cascade_product_delete"
  BEFORE DELETE ON "Product"
  BEGIN
    DELETE FROM "Message" WHERE "conversationId" IN (SELECT "id" FROM "Conversation" WHERE "productId" = OLD."id");
    DELETE FROM "Conversation" WHERE "productId" = OLD."id";
  END
`);

// ThemeConfig
await prisma.themeConfig.upsert({
  where: { id: "default" },
  update: {},
  create: { id: "default" },
});

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
  await prisma.category.upsert({
    where: { name: c.name },
    update: {},
    create: c,
  });
}

// Admin user
const admin = await prisma.user.upsert({
  where: { email: "admin@student-market.it" },
  update: {},
  create: {
    email: "admin@student-market.it",
    name: "Admin",
    password: hashPassword("admin123"),
    isAdmin: true,
  },
});

// Idealista scraper user
const idealista = await prisma.user.upsert({
  where: { email: "idealista@student-market.it" },
  update: {},
  create: {
    email: "idealista@student-market.it",
    name: "Idealista Scraper",
    password: hashPassword("idealista2026"),
    isAdmin: false,
  },
});

// Scraped listings
const listings = [
  { title: "Stanza in appartamento condiviso — Messina Centro", description: "Stanza luminosa in appartamento condiviso nel cuore del centro di Messina. A pochi passi dall'Università e dalla fermata del tram. La stanza è arredata con letto, scrivania e armadio. L'appartamento ha cucina abitabile, bagno condiviso e balcone. Spese incluse: riscaldamento, acqua e internet. Contratto per studenti con minimo 6 mesi.", price: 350, category: "Camera singola", address: "Via Garibaldi 45, Messina", latitude: 38.1925, longitude: 15.5524, images: ["https://imganuncios.mitula.net/affitto_stanza_messina_centro_2180123620594208209.jpg"] },
  { title: "Camera doppia in zona universitaria", description: "Camera doppia in appartamento ristrutturato a 200 metri dalla facoltà di Economia e Giurisprudenza. Ideale per due studenti che vogliono condividere la stanza. Arredata, con climatizzatore e accesso Wi-Fi. Cucina e bagno condivisi con altri studenti. Supermercato e fermata autobus nelle vicinanze.", price: 250, category: "Camera doppia", address: "Via dell'Università 12, Messina", latitude: 38.1960, longitude: 15.5480, images: ["https://imganuncios.mitula.net/affitto_stanza_universitaria_messina_7890123456789012345.jpg"] },
  { title: "Posto letto in residence studentesco", description: "Posto letto in moderna residenza universitaria con tutti i comfort. La struttura offre camere singole e doppie, con bagno privato, angolo studio, cucina in comune e area relax. Servizi inclusi: internet fibra, palestra, lavanderia e reception 24h. A 10 minuti a piedi dal Policlinico universitario.", price: 300, category: "Posto letto", address: "Viale San Martino 78, Messina", latitude: 38.1990, longitude: 15.5460, images: ["https://imganuncios.mitula.net/posto_letto_residence_studentesco_messina_5678901234567890123.jpg"] },
  { title: "Monolocale ristrutturato — Annunziata", description: "Monolocale indipendente recentemente ristrutturato in zona Annunziata. Composto da ingresso su soggiorno con angolo cottura, camera da letto matrimoniale e bagno finestrato. Riscaldamento autonomo, infissi nuovi con doppi vetri, pavimenti in legno. Posto auto scoperto di proprietà. Per studenti lavoratori o tirocinanti.", price: 500, category: "Monolocale", address: "Via Padre Annunziata 23, Messina", latitude: 38.2050, longitude: 15.5400, images: ["https://imganuncios.mitula.net/monolocale_annunziata_messina_3456789012345678901.jpg"] },
  { title: "Bilocale zona station — vicino Atm", description: "Bilocale al quarto piano con ascensore a 300 metri dalla stazione centrale. Soggiorno con cucina a vista, camera da letto matrimoniale, bagno con doccia e ripostiglio. Balcone abitabile con vista sullo stretto. Contratto 4+4 o transitorio per studenti. Disponibile da settembre.", price: 550, category: "Bilocale", address: "Via Tommaso Cannizzaro 8, Messina", latitude: 38.1900, longitude: 15.5600, images: ["https://imganuncios.mitula.net/bilocale_stazione_messina_9012345678901234567.jpg"] },
  { title: "Appartamento tre camere — Gazzi", description: "Grande appartamento in zona Gazzi con tre camere da letto, cucina abitabile, bagno finestrato e due balconi. L'immobile è al primo piano con ingresso indipendente. Adatto per gruppi di 3-4 studenti. Vicino al Policlinico e alla facoltà di Medicina. Prezzo totale: 700€ (divisibile tra gli inquilini).", price: 700, category: "Appartamento", address: "Via Gazzi 112, Messina", latitude: 38.1750, longitude: 15.5650, images: ["https://imganuncios.mitula.net/appartamento_gazzi_messina_1234567890123456789.jpg"] },
  { title: "Stanza con balcone — Via Centonze", description: "Camera singola arredata con balcone privato in appartamento condiviso da 4 camere. Due bagni, cucina grande e soggiorno. Zona ben collegata con autobus per il centro e le università. Bollita caldaia centralizzata inclusa. Spese condominiali: 50€ mensili. Ideale per studente fuori sede.", price: 380, category: "Camera singola", address: "Via Centonze 67, Messina", latitude: 38.1850, longitude: 15.5750, images: ["https://imganuncios.mitula.net/stanza_con_balcone_centonze_messina_6789012345678901234.jpg"] },
  { title: "Posto letto femminile — Zona Giostra", description: "Posto letto in appartamento solo femminile a Giostra. Camera condivisa con una ragazza, bagno in comune, cucina attrezzata e soggiorno. Ambiente tranquillo e pulito. A 5 minuti dalla fermata del bus e a 15 minuti dal centro. Affitto include tutte le utenze. Preferibilmente studentessa universitaria.", price: 280, category: "Posto letto", address: "Via Giostra 34, Messina", latitude: 38.2100, longitude: 15.5380, images: ["https://imganuncios.mitula.net/posto_letto_femminile_giostra_messina_2345678901234567890.jpg"] },
  { title: "Camera singola con bagno — Principe Umberto", description: "Camera singola con bagno privato in appartamento di recente costruzione. Zona Principe Umberto, vicino a fermate autobus, supermercati e farmacia. La camera ha ingresso indipendente, armadio a muro e connessione fibra ottica. Cucina condivisa con un altro studente. Contratto registrato.", price: 420, category: "Camera singola", address: "Viale Principe Umberto 55, Messina", latitude: 38.1955, longitude: 15.5510, images: ["https://imganuncios.mitula.net/camera_con_bagno_principe_umberto_messina_8901234567890123456.jpg"] },
  { title: "Monolocale con terrazzo — Tremestieri", description: "Monolocale con terrazzo abitabile di 20 mq in zona Tremestieri. Open space con cucina angolo living, soppalco letto e bagno con doccia idromassaggio. Posto auto privato. Arredato e climatizzato. Ideale per studenti fuori sede o giovani lavoratori. A 5 minuti dall'uscita autostradale.", price: 480, category: "Monolocale", address: "Via Tremestieri 156, Messina", latitude: 38.1600, longitude: 15.5200, images: ["https://imganuncios.mitula.net/monolocale_terrazzo_tremestieri_messina_4567890123456789012.jpg"] },
  { title: "Camera doppia con vista mare", description: "Camera doppia con finestra panoramica sullo Stretto di Messina. Appartamento al sesto piano con ascensore. La camera è arredata con due letti singoli, due scrivanie e armadio. Cucina e bagno condivisi. Riscaldamento e acqua inclusi. Zona barriera, vicino al tram e al centro storico.", price: 320, category: "Camera doppia", address: "Via La Farina 18, Messina", latitude: 38.1880, longitude: 15.5580, images: ["https://imganuncios.mitula.net/camera_doppia_vista_mare_messina_0123456789012345678.jpg"] },
  { title: "Stanza in villa — San Licandro", description: "Camera singola in villa indipendente a San Licandro. Ampia camera con arredi originali, giardino privato condiviso e posto auto. Cucina grande e bagno con vasca. Tranquillo, ideale per chi studia o lavora da casa. Collegamento bus per Messina centro ogni 20 minuti. Canone tutto incluso.", price: 400, category: "Camera singola", address: "Via San Licandro 7, Messina", latitude: 38.2200, longitude: 15.5300, images: ["https://imganuncios.mitula.net/stanza_villa_san_licandro_messina_6543210987654321098.jpg"] },
  { title: "Bilocale arredato — Piazza Dante", description: "Bilocale completamente arredato in pieno centro storico. A pochi passi da Piazza Dante e dal Duomo. Composto da soggiorno con divano letto, cucina abitabile, camera da letto e bagno. Pavimenti in ceramica, soffitti alti con travi a vista. Ottimo per studente singolo o coppia.", price: 530, category: "Bilocale", address: "Piazza Dante 3, Messina", latitude: 38.1910, longitude: 15.5545, images: ["https://imganuncios.mitula.net/bilocale_piazza_dante_messina_3210987654321098765.jpg"] },
  { title: "Appartamento condiviso — Via dei Mille", description: "Appartamento condiviso da 5 camere in Via dei Mille. Camere singole disponibili, tutte ampie e luminose. Due bagni, cucina grande con lavastoviglie, salotto TV e lavanderia. Fibra ottica 1 Gbps. Già abitato da studenti universitari. Spese 50€ mensili pro capite. Ambiente internazionale e festoso.", price: 360, category: "Camera singola", address: "Via dei Mille 88, Messina", latitude: 38.1860, longitude: 15.5555, images: ["https://imganuncios.mitula.net/appartamento_condiviso_mille_messina_5432109876543210987.jpg"] },
  { title: "Posto letto maschile — Santa Cecilia", description: "Posto letto in appartamento maschile zona Santa Cecilia. Camera tripla con letti singoli, armadi personali e scrivania. Bagno condiviso tra due camere. Cucina e soggiorno in comune. Vicino alla facoltà di Ingegneria. Firma contratto a settembre. Preferibilmente studenti universitari.", price: 260, category: "Posto letto", address: "Via Santa Cecilia 91, Messina", latitude: 38.2010, longitude: 15.5420, images: ["https://imganuncios.mitula.net/posto_letto_maschile_santa_cecilia_messina_8765432109876543210.jpg"] },
  { title: "Studiolo indipendente — Gravitelli", description: "Piccolo studiolo indipendente in zona Gravitelli con ingresso autonomo. Open space con letto a scomparsa, angolo cottura e bagno stretto ma funzionale. Ideale per una persona. Riscaldamento autonomo, aria condizionata. Bollletta inclusa fino a 80€ mensili. Per studenti o tirocinanti. Contratto a termine.", price: 370, category: "Monolocale", address: "Via Gravitelli 22, Messina", latitude: 38.1830, longitude: 15.5480, images: ["https://imganuncios.mitula.net/studiolo_indipendente_gravitelli_messina_1357924680135792468.jpg"] },
  { title: "Camera in appartamento con giardino", description: "Camera singola in appartamento al piano terra con giardino privato. Zona Torrerossa, tranquilla e ben servita. La camera è arredata e ha accesso diretto al giardino. Cucina e bagno condivisi con altri due coinquilini. Per studenti fuori sede. Contratto di affitto registrato. Disponibile subito.", price: 340, category: "Camera singola", address: "Via Torrerossa 42, Messina", latitude: 38.2150, longitude: 15.5250, images: ["https://imganuncios.mitula.net/camera_giardino_torrerossa_messina_2468135790246813579.jpg"] },
  { title: "Appartamento tre locali — viale San Martino", description: "Appartamento di tre locali in viale San Martino, zona centrale e ben collegata. Soggiorno con cucina a vista, camera da letto matrimoniale e cameretta singola, bagno finestrato. Balcone per tutta la lunghezza. Poco traffico, vicino a fermate Atm e supermercati. Adatto per studenti condivisibile tra 2-3 persone.", price: 650, category: "Appartamento", address: "Viale San Martino 201, Messina", latitude: 38.2000, longitude: 15.5440, images: ["https://imganuncios.mitula.net/appartamento_san_martino_messina_9876543210987654321.jpg"] },
  { title: "Camera doppia — Zona Policlinico", description: "Camera doppia a 50 metri dal Policlinico universitario. Appartamento al secondo piano con ascensore, composto da 3 camere (di cui questa doppia), cucina e due bagni. La camera ha due posti letto, scrivanie e armadio. Adatta per studenti di Medicina e Professioni Sanitarie. Contratto a canone concordato.", price: 270, category: "Camera doppia", address: "Via Consolare Valeria 156, Messina", latitude: 38.1700, longitude: 15.5700, images: ["https://imganuncios.mitula.net/camera_doppia_policlinico_messina_1470369258147036925.jpg"] },
  { title: "Stanza ristrutturata — centro storico", description: "Stanza singola ristrutturata in palazzo storico del centro. Affaccio su cortile interno silenzioso. Arredata con letto contenitore, scrivania grande e libreria. Riscaldamento autonomo, infissi nuovi. Appartamento con 4 camere totali, cucina nuova e bagno con doccia. Convivenza giovani studenti lavoratori. Spese incluse.", price: 390, category: "Camera singola", address: "Via XXVII Luglio 31, Messina", latitude: 38.1890, longitude: 15.5560, images: ["https://imganuncios.mitula.net/stanza_ristrutturata_centro_messina_5813479135792468024.jpg"] },
];

const existing = await prisma.product.findMany({ take: 1 });
if (existing.length === 0) {
  for (const ad of listings) {
    await prisma.product.create({
      data: {
        ...ad,
        images: JSON.stringify(ad.images),
        image: ad.images[0] || null,
        city: "Messina",
        sellerId: idealista.id,
      },
    });
  }
  console.log(`Seeded ${listings.length} listings with city=Messina`);
} else {
  console.log("Listings already exist, skipping");
}

console.log("Seed complete");
await prisma.$disconnect();
