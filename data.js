export const olexProducts = {
  ppf: {
    name: "PPF (Paint Protection Film)",
    series: [
      { id: "carat", name: "OLEX Carat Series", microns: [190, 210, 250, 300, 350], basePrice: 18000, description: "Premium kalite, 5 farklı kalınlık seçeneği" },
      { id: "platinum", name: "OLEX Platinum Series", microns: [190, 210, 250, 300], basePrice: 16000, description: "Güçlü koruma ve zarif estetik" },
      { id: "crystal", name: "OLEX Crystal Series", microns: [190, 210], basePrice: 14000, description: "Kristal berraklığında koruma" },
      { id: "ultra", name: "OLEX Ultra", microns: [190], basePrice: 12000, description: "Ekonomik premium koruma" },
      { id: "matte", name: "OLEX Matte Series", microns: [190, 210], basePrice: 17000, description: "Mat görünüm, estetik koruma" },
      { id: "colored", name: "OLEX Colored Series", microns: [200], basePrice: 19000, description: "Renkli film seçenekleri" },
    ],
  },
  windowFilm: {
    name: "Cam Filmleri",
    products: [
      { id: "solex", name: "OLEX Solex", price: 3500, description: "Üstün ısı yalıtımı ve net görüş" },
      { id: "stella", name: "OLEX Stella", price: 3000, description: "Şık ve gizlilik odaklı film" },
      { id: "vega", name: "OLEX Vega", price: 2800, description: "UV koruma ve modern görünüm" },
      { id: "signer", name: "OLEX Signer", price: 3200, description: "Maksimum konfor ve güneş koruması" },
      { id: "sky", name: "OLEX Sky", price: 2500, description: "Doğal ışık ve rahat sürüş" },
      { id: "metalx", name: "OLEX MetalX", price: 3800, description: "Isı yansıtıcı metalik film" },
    ],
  },
  ceramic: {
    name: "Seramik Kaplama",
    products: [
      { id: "premium", name: "Premium Seramik", price: 8000, duration: "3 Yıl", description: "En yüksek koruma ve parlaklık" },
      { id: "standard", name: "Standard Seramik", price: 5000, duration: "2 Yıl", description: "Kaliteli koruma ve dayanıklılık" },
      { id: "basic", name: "Basic Seramik", price: 3500, duration: "1 Yıl", description: "Temel seramik koruma" },
    ],
  },
  
};
export const windowGlassParts = [
  { id: "windshield", name: "Ön Cam", price: 2000 },
  { id: "rear-window", name: "Arka Cam", price: 1500 },
  { id: "front-side-left", name: "Sol Ön Yan Cam", price: 750 },
  { id: "front-side-right", name: "Sağ Ön Yan Cam", price: 750 },
  { id: "rear-side-left", name: "Sol Arka Yan Cam", price: 750 },
  { id: "rear-side-right", name: "Sağ Arka Yan Cam", price: 750 },
  { id: "sunroof", name: "Sunroof / Cam Tavan", price: 1500 },
];

export const washServices = [
  { id: "standard-wash", name: "Standart Yıkama (İç/Dış)", price: 400 },
  { id: "detailed-wash", name: "Detaylı Yıkama & Valet", price: 1200 },
  { id: "engine-wash", name: "Motor Yıkama & Koruma", price: 800 },
  { id: "seat-cleaning", name: "Koltuk Yıkama (Adet)", price: 300 },
  { id: "ozon", name: "Ozon Dezenfeksiyon", price: 500 },
];

export const carParts = [
  { id: "hood", name: "Kaput", price: 3000 },
  { id: "roof", name: "Çatı", price: 2500 },
  { id: "trunk", name: "Bagaj", price: 2000 },
  { id: "front-bumper", name: "Ön Tampon", price: 1500 },
  { id: "rear-bumper", name: "Arka Tampon", price: 1500 },
  { id: "front-fender-left", name: "Sol Ön Çamurluk", price: 1200 },
  { id: "front-fender-right", name: "Sağ Ön Çamurluk", price: 1200 },
  { id: "rear-fender-left", name: "Sol Arka Çamurluk", price: 1200 },
  { id: "rear-fender-right", name: "Sağ Arka Çamurluk", price: 1200 },
  { id: "door-fl", name: "Sol Ön Kapı", price: 1000 },
  { id: "door-fr", name: "Sağ Ön Kapı", price: 1000 },
  { id: "door-rl", name: "Sol Arka Kapı", price: 1000 },
  { id: "door-rr", name: "Sağ Arka Kapı", price: 1000 },
  { id: "mirror-left", name: "Sol Ayna", price: 300 },
  { id: "mirror-right", name: "Sağ Ayna", price: 300 },
  { id: "rocker-left", name: "Sol Marşpiyel", price: 800 },
  { id: "rocker-right", name: "Sağ Marşpiyel", price: 800 },
];