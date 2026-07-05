export const regions = [
  {
    name: "Sicilia",
    provinces: [
      { name: "Messina", cities: ["Messina", "Barcellona Pozzo di Gotto", "Milazzo", "Taormina", "Capo d'Orlando", "Lipari", "Sant'Agata di Militello", "Patti", "Giardini Naxos", "Letojanni"] },
      { name: "Palermo", cities: ["Palermo", "Bagheria", "Monreale", "Carini", "Partinico", "Cefalù", "Misilmeri", "Termini Imerese"] },
      { name: "Catania", cities: ["Catania", "Acireale", "Paternò", "Misterbianco", "Gravina di Catania", "Caltagirone", "Adrano", "Giarre"] },
      { name: "Siracusa", cities: ["Siracusa", "Augusta", "Avola", "Noto", "Lentini", "Floridia", "Pachino"] },
      { name: "Trapani", cities: ["Trapani", "Marsala", "Mazara del Vallo", "Alcamo", "Castelvetrano", "Erice"] },
      { name: "Agrigento", cities: ["Agrigento", "Sciacca", "Licata", "Canicattì", "Favara", "Ribera"] },
      { name: "Ragusa", cities: ["Ragusa", "Vittoria", "Modica", "Comiso", "Scicli"] },
      { name: "Caltanissetta", cities: ["Caltanissetta", "Gela", "Niscemi", "San Cataldo", "Mazzarino"] },
      { name: "Enna", cities: ["Enna", "Piazza Armerina", "Nicosia", "Leonforte", "Barrafranca"] },
    ],
  },
  {
    name: "Calabria",
    provinces: [
      { name: "Reggio Calabria", cities: ["Reggio Calabria", "Villa San Giovanni", "Palmi", "Gioia Tauro", "Siderno", "Melito di Porto Salvo", "Bovalino", "Locri"] },
      { name: "Cosenza", cities: ["Cosenza", "Corigliano-Rossano", "Rende", "Castrovillari", "Acri", "Paola", "Cariati"] },
      { name: "Catanzaro", cities: ["Catanzaro", "Lamezia Terme", "Soverato", "Cropani", "Borgia"] },
      { name: "Crotone", cities: ["Crotone", "Isola di Capo Rizzuto", "Cirò Marina", "Petilia Policastro"] },
      { name: "Vibo Valentia", cities: ["Vibo Valentia", "Tropea", "Pizzo", "Nicotera", "Serra San Bruno"] },
    ],
  },
  {
    name: "Campania",
    provinces: [
      { name: "Napoli", cities: ["Napoli", "Pozzuoli", "Casoria", "Giugliano in Campania", "Torre del Greco", "Afragola", "Marano di Napoli", "Portici", "Ercolano", "Castellammare di Stabia", "Sorrento"] },
      { name: "Salerno", cities: ["Salerno", "Cava de' Tirreni", "Battipaglia", "Nocera Inferiore", "Eboli", "Amalfi"] },
      { name: "Caserta", cities: ["Caserta", "Aversa", "Marcianise", "Santa Maria Capua Vetere", "Mondragone"] },
      { name: "Avellino", cities: ["Avellino", "Ariano Irpino", "Mercogliano", "Solofra"] },
      { name: "Benevento", cities: ["Benevento", "Sant'Agata de' Goti", "Montesarchio"] },
    ],
  },
  {
    name: "Lazio",
    provinces: [
      { name: "Roma", cities: ["Roma", "Fiumicino", "Guidonia Montecelio", "Civitavecchia", "Tivoli", "Velletri", "Pomezia", "Anzio", "Ladispoli", "Albano Laziale"] },
      { name: "Latina", cities: ["Latina", "Aprilia", "Terracina", "Fondi", "Formia", "Gaeta"] },
      { name: "Frosinone", cities: ["Frosinone", "Cassino", "Alatri", "Sora", "Ceccano"] },
      { name: "Viterbo", cities: ["Viterbo", "Civita Castellana", "Tarquinia", "Montefiascone"] },
      { name: "Rieti", cities: ["Rieti", "Fara in Sabina"] },
    ],
  },
  {
    name: "Lombardia",
    provinces: [
      { name: "Milano", cities: ["Milano", "Sesto San Giovanni", "Cinisello Balsamo", "Legnano", "Rho", "Paderno Dugnano", "Rozzano", "San Donato Milanese", "Segrate", "Cologno Monzese"] },
      { name: "Bergamo", cities: ["Bergamo", "Treviglio", "Seriate", "Dalmine", "Romano di Lombardia"] },
      { name: "Brescia", cities: ["Brescia", "Desenzano del Garda", "Montichiari", "Palazzolo sull'Oglio", "Ghedi"] },
      { name: "Como", cities: ["Como", "Cantù", "Mariano Comense", "Erba", "Olgiate Comasco"] },
      { name: "Monza e Brianza", cities: ["Monza", "Lissone", "Seregno", "Desio", "Brugherio", "Vimercate"] },
      { name: "Pavia", cities: ["Pavia", "Voghera", "Vigevano", "Mortara"] },
      { name: "Varese", cities: ["Varese", "Busto Arsizio", "Gallarate", "Saronno", "Cassano Magnago"] },
      { name: "Mantova", cities: ["Mantova", "Castiglione delle Stiviere", "Suzzara"] },
      { name: "Cremona", cities: ["Cremona", "Crema", "Soresina"] },
      { name: "Sondrio", cities: ["Sondrio", "Morbegno", "Tirano"] },
      { name: "Lecco", cities: ["Lecco", "Merate", "Calolziocorte"] },
      { name: "Lodi", cities: ["Lodi", "Codogno", "Sant'Angelo Lodigiano"] },
    ],
  },
  {
    name: "Piemonte",
    provinces: [
      { name: "Torino", cities: ["Torino", "Moncalieri", "Collegno", "Rivoli", "Nichelino", "Settimo Torinese", "Grugliasco", "Chieri", "Venaria Reale", "Pinerolo"] },
      { name: "Alessandria", cities: ["Alessandria", "Casale Monferrato", "Novi Ligure", "Tortona", "Valenza"] },
      { name: "Novara", cities: ["Novara", "Borgomanero", "Trecate", "Galliate"] },
      { name: "Cuneo", cities: ["Cuneo", "Alba", "Bra", "Fossano", "Mondovì", "Savigliano"] },
      { name: "Asti", cities: ["Asti", "Canelli", "Nizza Monferrato"] },
      { name: "Vercelli", cities: ["Vercelli", "Borgosesia", "Santhià"] },
      { name: "Biella", cities: ["Biella", "Cossato", "Vigliano Biellese"] },
      { name: "Verbano-Cusio-Ossola", cities: ["Verbania", "Domodossola", "Omegna"] },
    ],
  },
  {
    name: "Veneto",
    provinces: [
      { name: "Venezia", cities: ["Venezia", "Mestre", "Chioggia", "San Donà di Piave", "Jesolo", "Portogruaro", "Marcon"] },
      { name: "Verona", cities: ["Verona", "Legnago", "Bussolengo", "San Giovanni Lupatoto", "Villafranca di Verona", "Peschiera del Garda"] },
      { name: "Padova", cities: ["Padova", "Abano Terme", "Monselice", "Este", "Piove di Sacco", "Cittadella", "Camposampiero"] },
      { name: "Vicenza", cities: ["Vicenza", "Bassano del Grappa", "Schio", "Thiene", "Arzignano", "Noventa Vicentina"] },
      { name: "Treviso", cities: ["Treviso", "Conegliano", "Castelfranco Veneto", "Villorba", "Mogliano Veneto", "Montebelluna"] },
      { name: "Rovigo", cities: ["Rovigo", "Adria", "Porto Tolle", "Lendinara"] },
      { name: "Belluno", cities: ["Belluno", "Feltre", "Cortina d'Ampezzo", "Sedico"] },
    ],
  },
  {
    name: "Emilia-Romagna",
    provinces: [
      { name: "Bologna", cities: ["Bologna", "Imola", "San Lazzaro di Savena", "Casalecchio di Reno", "Castel San Pietro Terme", "Budrio"] },
      { name: "Modena", cities: ["Modena", "Carpi", "Sassuolo", "Mirandola", "Formigine", "Vignola", "Castelfranco Emilia"] },
      { name: "Reggio nell'Emilia", cities: ["Reggio nell'Emilia", "Scandiano", "Correggio", "Guastalla", "Casalgrande"] },
      { name: "Parma", cities: ["Parma", "Fidenza", "Salsomaggiore Terme", "Collecchio", "Noceto"] },
      { name: "Ravenna", cities: ["Ravenna", "Faenza", "Lugo", "Cervia", "Alfonsine"] },
      { name: "Ferrara", cities: ["Ferrara", "Cento", "Comacchio", "Argenta", "Copparo"] },
      { name: "Forlì-Cesena", cities: ["Forlì", "Cesena", "Savignano sul Rubicone", "Cesenatico", "Gambettola"] },
      { name: "Rimini", cities: ["Rimini", "Riccione", "Cattolica", "Bellaria-Igea Marina", "Santarcangelo di Romagna"] },
      { name: "Piacenza", cities: ["Piacenza", "Fiorenzuola d'Arda", "Castel San Giovanni", "Bobbio"] },
    ],
  },
  {
    name: "Toscana",
    provinces: [
      { name: "Firenze", cities: ["Firenze", "Scandicci", "Sesto Fiorentino", "Empoli", "Bagno a Ripoli", "Fucecchio", "Figline Valdarno"] },
      { name: "Pisa", cities: ["Pisa", "Cascina", "San Giuliano Terme", "Pontedera", "Ponsacco"] },
      { name: "Siena", cities: ["Siena", "Poggibonsi", "Colle di Val d'Elsa", "Monteroni d'Arbia"] },
      { name: "Lucca", cities: ["Lucca", "Viareggio", "Capannori", "Camaiore", "Pietrasanta"] },
      { name: "Arezzo", cities: ["Arezzo", "San Giovanni Valdarno", "Cortona", "Montevarchi", "Bibbiena"] },
      { name: "Livorno", cities: ["Livorno", "Piombino", "Rosignano Marittimo", "Cecina", "Campiglia Marittima"] },
      { name: "Prato", cities: ["Prato", "Montemurlo", "Carmignano"] },
      { name: "Pistoia", cities: ["Pistoia", "Quarrata", "Monsummano Terme", "Montecatini Terme"] },
      { name: "Grosseto", cities: ["Grosseto", "Follonica", "Orbetello", "Massa Marittima"] },
      { name: "Massa-Carrara", cities: ["Massa", "Carrara", "Aulla", "Montignoso"] },
    ],
  },
  {
    name: "Puglia",
    provinces: [
      { name: "Bari", cities: ["Bari", "Altamura", "Molfetta", "Bitonto", "Gravina in Puglia", "Palo del Colle", "Triggiano", "Corato", "Modugno", "Monopoli"] },
      { name: "Lecce", cities: ["Lecce", "Nardò", "Gallipoli", "Copertino", "Casarano", "Maglie", "Galatina", "Tricase"] },
      { name: "Foggia", cities: ["Foggia", "Cerignola", "Manfredonia", "San Severo", "Lucera", "Vieste"] },
      { name: "Taranto", cities: ["Taranto", "Martina Franca", "Grottaglie", "Manduria", "Massafra", "Ginosa"] },
      { name: "Brindisi", cities: ["Brindisi", "Fasano", "Mesagne", "Francavilla Fontana", "Ostuni"] },
      { name: "Barletta-Andria-Trani", cities: ["Barletta", "Andria", "Trani", "Canosa di Puglia", "Bisceglie"] },
    ],
  },
  {
    name: "Abruzzo",
    provinces: [
      { name: "L'Aquila", cities: ["L'Aquila", "Avezzano", "Sulmona", "Celano", "Pratola Peligna"] },
      { name: "Pescara", cities: ["Pescara", "Montesilvano", "Spoltore", "Città Sant'Angelo", "Penne"] },
      { name: "Chieti", cities: ["Chieti", "Lanciano", "Vasto", "Ortona", "San Salvo", "Francavilla al Mare"] },
      { name: "Teramo", cities: ["Teramo", "Giulianova", "Roseto degli Abruzzi", "Martinsicuro", "Atri"] },
    ],
  },
  {
    name: "Liguria",
    provinces: [
      { name: "Genova", cities: ["Genova", "Rapallo", "Chiavari", "Sestri Levante", "Lavagna", "Santa Margherita Ligure"] },
      { name: "La Spezia", cities: ["La Spezia", "Sarzana", "Arcola", "Lerici", "Santo Stefano di Magra"] },
      { name: "Savona", cities: ["Savona", "Albenga", "Varazze", "Cairo Montenotte", "Finale Ligure"] },
      { name: "Imperia", cities: ["Imperia", "Sanremo", "Ventimiglia", "Taggia", "Diano Marina"] },
    ],
  },
  {
    name: "Marche",
    provinces: [
      { name: "Ancona", cities: ["Ancona", "Senigallia", "Jesi", "Osimo", "Fabriano", "Loreto"] },
      { name: "Pesaro e Urbino", cities: ["Pesaro", "Urbino", "Fano", "Fossombrone", "Mondavio"] },
      { name: "Macerata", cities: ["Macerata", "Civitanova Marche", "Tolentino", "Recanati", "Potenza Picena"] },
      { name: "Ascoli Piceno", cities: ["Ascoli Piceno", "San Benedetto del Tronto", "Folignano", "Castel di Lama"] },
      { name: "Fermo", cities: ["Fermo", "Porto Sant'Elpidio", "Sant'Elpidio a Mare", "Porto San Giorgio"] },
    ],
  },
  {
    name: "Sardegna",
    provinces: [
      { name: "Cagliari", cities: ["Cagliari", "Quartu Sant'Elena", "Selargius", "Assemini", "Capoterra", "Monserrato", "Sestu"] },
      { name: "Sassari", cities: ["Sassari", "Alghero", "Porto Torres", "Sennori", "Castelsardo", "Ozieri"] },
      { name: "Nuoro", cities: ["Nuoro", "Siniscola", "Macomer", "Orosei", "Dorgali"] },
      { name: "Oristano", cities: ["Oristano", "Cabras", "Marrubiu", "Santa Giusta"] },
      { name: "Sud Sardegna", cities: ["Carbonia", "Iglesias", "Sant'Antioco", "Monserrato"] },
    ],
  },
  {
    name: "Umbria",
    provinces: [
      { name: "Perugia", cities: ["Perugia", "Foligno", "Città di Castello", "Spoleto", "Gubbio", "Assisi", "Todi", "Umbertide", "Magione"] },
      { name: "Terni", cities: ["Terni", "Orvieto", "Narni", "Amelia"] },
    ],
  },
  {
    name: "Friuli-Venezia Giulia",
    provinces: [
      { name: "Udine", cities: ["Udine", "Cervignano del Friuli", "Codroipo", "Tavagnacco", "Latisana", "Cividale del Friuli", "Tolmezzo"] },
      { name: "Pordenone", cities: ["Pordenone", "Sacile", "Cordenons", "Azzano Decimo", "Porcia"] },
      { name: "Trieste", cities: ["Trieste", "Muggia", "Duino-Aurisina"] },
      { name: "Gorizia", cities: ["Gorizia", "Monfalcone", "Gradisca d'Isonzo", "Ronchi dei Legionari"] },
    ],
  },
  {
    name: "Trentino-Alto Adige",
    provinces: [
      { name: "Trento", cities: ["Trento", "Rovereto", "Pergine Valsugana", "Arco", "Riva del Garda", "Ala", "Borgo Valsugana"] },
      { name: "Bolzano", cities: ["Bolzano", "Merano", "Bressanone", "Brunico", "Laives", "Appiano sulla Strada del Vino"] },
    ],
  },
  {
    name: "Molise",
    provinces: [
      { name: "Campobasso", cities: ["Campobasso", "Termoli", "Bojano", "Riccia", "Larino"] },
      { name: "Isernia", cities: ["Isernia", "Venafro", "Agnone"] },
    ],
  },
  {
    name: "Basilicata",
    provinces: [
      { name: "Potenza", cities: ["Potenza", "Melfi", "Lauria", "Avigliano", "Rionero in Vulture"] },
      { name: "Matera", cities: ["Matera", "Pisticci", "Policoro", "Bernalda", "Montalbano Jonico"] },
    ],
  },
  {
    name: "Valle d'Aosta",
    provinces: [
      { name: "Aosta", cities: ["Aosta", "Saint-Vincent", "Châtillon", "Courmayeur", "Verrayes"] },
    ],
  },
];

export function getAllCities() {
  const cities = [];
  for (const region of regions) {
    for (const province of region.provinces) {
      for (const city of province.cities) {
        cities.push({ city, province: province.name, region: region.name });
      }
    }
  }
  return cities;
}

export function getProvinces() {
  const provinces = [];
  for (const region of regions) {
    for (const province of region.provinces) {
      provinces.push({ name: province.name, region: region.name });
    }
  }
  return provinces;
}
