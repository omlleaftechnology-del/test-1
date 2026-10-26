// Listing descriptions and stable French request values.
Pivert.details = {commercial:['COMMERCIAL · PIERREVILLE','De la place pour vos ambitions','Local commercial de 5 000 pi² au 10, rue Georges, Pierreville, QC J0G 1J0. Tarif affiché sur Facebook : 12 $ / pi². La période de facturation, les charges, les conditions du bail et la disponibilité doivent être confirmées avec Pivert. La photographie est une image d’ambiance, pas une photo du local.','Local commercial — Pierreville'],residential:['RÉSIDENTIEL · LOCATION LONGUE DURÉE','Votre prochain chez-vous','Indiquez le secteur recherché, le nombre de pièces, votre budget et votre date souhaitée. Cette carte présente la catégorie résidentielle : aucun logement précis ni disponibilité ne sont annoncés ici. La photographie est illustrative.','Location résidentielle'],business:['COMMERCIAL · LOCATION LONGUE DURÉE','Un espace pour vos idées','Parlez-nous de votre activité, de la superficie et du secteur recherchés. Notre équipe pourra échanger avec vous sur les possibilités. Cette carte présente une catégorie, pas un local disponible. La photographie est illustrative.','Autre espace commercial']};

// Replace these illustrative images with verified property photographs.
Pivert.properties = {
  commercial: {
    area: '5 000 pi²', address: '10, rue Georges, Pierreville, QC J0G 1J0', price: '12 $ / pi²',
    photos: ['photo-1497366754035-f200968a6e72', 'photo-1497366811353-6870744d04b2', 'photo-1497366216548-37526070297c']
  },
  residential: {
    area: 'À confirmer', address: 'Adresse à confirmer', price: 'Sur demande',
    photos: ['photo-1600210492486-724fe5c67fb0', 'photo-1600607687939-ce8a6c25118c', 'photo-1600566753086-00f18fb6b3ea']
  },
  business: {
    area: 'À confirmer', address: 'Adresse à confirmer', price: 'Sur demande',
    photos: ['photo-1497366811353-6870744d04b2', 'photo-1497366754035-f200968a6e72', 'photo-1497366216548-37526070297c']
  }
};

// Verified listing supplied by the owner.
Pivert.details.commercial = ["COMMERCIAL · PIERREVILLE", "Local commercial · Pierreville", "Au cœur du village de Pierreville, ce local commercial d’environ 5 000 pi² offre une excellente visibilité et un accès facile. Il se trouve à proximité de l’épicerie, de la pharmacie et de commerces de proximité générant un achalandage constant. Le secteur dessert un bassin d’environ 5 000 personnes de Pierreville et des municipalités environnantes.", "Local commercial — Pierreville"];
Pivert.properties.commercial = {
  "area": "Environ 5 000 pi²",
  "address": "10, rue Georges, Pierreville, QC J0G 1J0",
  "price": "12 $ / pi²",
  "availability": "Immédiatement ou selon entente",
  "photos": [
    "assets/pierreville-1.jpg",
    "assets/pierreville-2.jpg",
    "assets/pierreville-3.jpg"
  ],
  "realPhotos": true,
  "features": [
    "Environ 5 000 pi² de superficie",
    "Au cœur du village de Pierreville",
    "Excellente visibilité commerciale",
    "Accès facile et stationnement à proximité",
    "Épicerie, pharmacie et commerces à proximité"
  ],
  "uses": [
    "Commerce de détail",
    "Clinique professionnelle",
    "Bureau de services",
    "Centre de conditionnement",
    "Salle de montre",
    "Entreprise de services spécialisés",
    "Espace communautaire ou institutionnel"
  ]
};

// Residential listing and visualizations supplied by the owner.
Pivert.details.residential = ["RÉSIDENTIEL · DRUMMONDVILLE", "4 ½ neuf · rue Marchand", "Superbe logement 4 ½ de construction neuve, lumineux et à aire ouverte, dans un environnement paisible. Une grande chambre avec walk-in, une insonorisation supérieure et un climatiseur mural offrent un confort au quotidien. À quelques minutes des épiceries, des écoles, du Cégep, de la gare et de l’hôpital. Les images fournies sont des visualisations du bâtiment et de l’aménagement; elles ne constituent pas une visite 3D.", "4 ½ — 500 rue Marchand"];
Pivert.properties.residential = {
  "area": "Superficie à préciser",
  "address": "500 rue Marchand, Drummondville",
  "price": "1 295 $ / mois",
  "availability": "À partir du 1er octobre 2026 — disponibilité à confirmer",
  "photos": [
    "assets/marchand-1.jpg",
    "assets/marchand-2.jpg",
    "assets/marchand-3.jpg",
    "assets/marchand-4.jpg",
    "assets/marchand-5.jpg"
  ],
  "realPhotos": false,
  "imageLabel": "Visualisation du logement",
  "galleryNote": "Visualisations fournies — aménagement indicatif",
  "features": [
    "Aire ouverte spacieuse",
    "Grande chambre avec walk-in",
    "Climatiseur mural",
    "Insonorisation supérieure",
    "Stationnement inclus — possibilité de 2 places",
    "Rangement extérieur",
    "À quelques minutes des commerces, écoles, Cégep, gare et hôpital"
  ],
  "rentNote": "Disponibilité actuelle à confirmer auprès de Pivert.",
  "layout": "4 ½"
};

// Separate project based on the supplied architectural drawings.
Pivert.details.foucault = ["PROJET SUR PLANS · MODÈLE 3D", "661 Foucault · projet 3D", "Maquette extérieure du projet au 661, boulevard Foucault, St-Charles-de-Drummond, réalisée à partir des élévations A200–A201, du plan d’étages A302, du plan de toiture A320 et des niveaux de la coupe A400. Le projet prévoit 20 logements sur trois étages et un rez-de-jardin. Les volumes principaux, niveaux, balcons et ouvertures sont repris des dessins; les raccords de toiture et détails de finition sont simplifiés. Cette carte présente une maquette de projet, pas une annonce de logement disponible.", "Projet — 661 Foucault"];
Pivert.properties.foucault = {
  "area": "Emprise : environ 568 m²",
  "address": "661, boul. Foucault, St-Charles-de-Drummond",
  "price": "Projet — non proposé à la location",
  "photos": [
    "assets/foucault-model.png",
    "assets/foucault-elevation.png",
    "assets/foucault-side.png",
    "assets/foucault-floor.png"
  ],
  "imageLabel": "Projet architectural",
  "galleryNote": "Maquette et extraits des plans fournis",
  "features": [
    "20 logements : 9 de type 3 ½, 4 de type 4 ½ et 7 de type 5 ½",
    "3 étages et un rez-de-jardin",
    "Emprise annoncée : 6 112 pi², soit environ 568 m²",
    "Dimensions principales du plan : environ 34 × 16,4 m",
    "Toiture en pente 3,5:12 avec pignons secondaires",
    "Fibrociment beige, imitation bois, accents blancs et maçonnerie gris foncé",
    "Balcons et garde-corps blancs selon les élévations"
  ],
  "rentNote": "Maquette de présentation : détails simplifiés, sans validation technique."
};
