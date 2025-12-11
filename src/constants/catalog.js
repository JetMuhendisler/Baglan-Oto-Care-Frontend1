export const SERVICE_CATALOG = [
  {
    id: "ppf",
    name: "PPF Kaplama",
    category: "PPF",
    description: "Yüksek korumalı boya koruma filmi.",
    hasMicronOption: true,
    hasPartBasedPricing: true,
    products: [
      {
        name: "OLEX Platinum Series",
        microns: [190, 210, 250],
        basePrice: 0, // Parça bazlı hesaplanacak
        partPrices: [
          { partName: "Kaput", price: 3000 },
          { partName: "Çamurluk (Adet)", price: 1500 },
          { partName: "Tampon (Adet)", price: 1500 },
          { partName: "Tüm Araç", price: 16000 } // Full paket
        ]
      },
      {
        name: "OLEX Carat Series",
        microns: [150, 180],
        partPrices: [
          { partName: "Kaput", price: 2500 },
          { partName: "Tüm Araç", price: 14000 }
        ]
      }
    ]
  },
  {
    id: "ceramic",
    name: "Seramik Kaplama",
    category: "Seramik",
    description: "Parlaklık ve su iticilik.",
    hasMicronOption: false,
    hasPartBasedPricing: false, // Paket fiyat
    products: [
      { name: "Premium Seramik (3 Yıl)", price: 8000 },
      { name: "Standard Seramik (2 Yıl)", price: 5000 }
    ]
  },
  {
    id: "window",
    name: "Cam Filmi",
    category: "Cam Filmi",
    description: "Isı ve UV koruması.",
    hasMicronOption: false,
    hasPartBasedPricing: true,
    products: [
      {
        name: "OLEX Rayblock",
        partPrices: [
          { partName: "Ön Cam", price: 2000 },
          { partName: "Yan Camlar (Takım)", price: 3000 },
          { partName: "Sunroof", price: 1000 }
        ]
      }
    ]
  }
];