export type InflationMockRecord = {
  year: number;
  purchasingPowerIndex: number;
  estimatedInflationRate: number;
  usdTryReference: number;
  note: string;
};

export const MOCK_INFLATION_DATA: InflationMockRecord[] = [
  {
    year: 2022,
    purchasingPowerIndex: 100,
    estimatedInflationRate: 64.27,
    usdTryReference: 18.7,
    note: "Baz yıl kabul edildi (Endeks = 100)",
  },
  {
    year: 2023,
    purchasingPowerIndex: 68,
    estimatedInflationRate: 64.77,
    usdTryReference: 29.5,
    note: "Satın alma gücünde belirgin düşüş başlangıcı",
  },
  {
    year: 2024,
    purchasingPowerIndex: 47,
    estimatedInflationRate: 45.5,
    usdTryReference: 33.1,
    note: "Enflasyonla mücadele yılı",
  },
  {
    year: 2025,
    purchasingPowerIndex: 36,
    estimatedInflationRate: 28.5,
    usdTryReference: 39.5,
    note: "Kademeli dezenflasyon süreci öngörüsü",
  },
  {
    year: 2026,
    purchasingPowerIndex: 30,
    estimatedInflationRate: 18.5,
    usdTryReference: 43.5,
    note: "Mevcut yıl projeksiyonu",
  },
];

export const INFLATION_DISCLAIMER =
  "Bu veri seti akademik/demo amaçlıdır; resmi TÜFE verisi değildir ve yatırım tavsiyesi içermez.";
