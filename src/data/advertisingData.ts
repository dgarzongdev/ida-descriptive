import { MediumKey, MediumMeta, RawAdRecord, ProcessedAdRecord } from '../types';

export const MEDIA_METADATA: Record<MediumKey, MediumMeta> = {
  digital: {
    key: 'digital',
    label: 'Digital (Search, Social, Display, Video)',
    shortLabel: 'Digital',
    color: '#06b6d4', // Cyan
    gradient: 'from-cyan-500 to-blue-600',
    category: 'digital',
    firstAvailableYear: 2008,
    description: 'Inversión en plataformas digitales, programática, redes sociales, buscadores y video online.'
  },
  tvNacional: {
    key: 'tvNacional',
    label: 'Televisión Nacional',
    shortLabel: 'TV Nacional',
    color: '#3b82f6', // Blue
    gradient: 'from-blue-600 to-indigo-600',
    category: 'broadcast',
    firstAvailableYear: 1995,
    description: 'Canales abiertos de cobertura nacional (Caracol, RCN, etc.) y cable/suscripción nacional.'
  },
  radio: {
    key: 'radio',
    label: 'Radio (AM / FM)',
    shortLabel: 'Radio',
    color: '#f59e0b', // Amber
    gradient: 'from-amber-500 to-orange-500',
    category: 'broadcast',
    firstAvailableYear: 1998,
    description: 'Cadenas radiales y emisoras habladas y musicales de cobertura nacional y local.'
  },
  pubExterior: {
    key: 'pubExterior',
    label: 'Publicidad Exterior (OOH / DOOH)',
    shortLabel: 'Pub Exterior',
    color: '#10b981', // Emerald
    gradient: 'from-emerald-500 to-teal-600',
    category: 'ooh',
    firstAvailableYear: 2014,
    description: 'Vallas publicitarias, pantallas digitales (DOOH), mobiliario urbano, aeropuertos y transporte masivo.'
  },
  prensa: {
    key: 'prensa',
    label: 'Prensa Escrita',
    shortLabel: 'Prensa',
    color: '#8b5cf6', // Violet
    gradient: 'from-purple-500 to-violet-600',
    category: 'print',
    firstAvailableYear: 2003,
    description: 'Periódicos y diarios impresos nacionales y regionales (ediciones impresas).'
  },
  tvRegional: {
    key: 'tvRegional',
    label: 'Televisión Regional y Local',
    shortLabel: 'TV Regional',
    color: '#ec4899', // Pink
    gradient: 'from-pink-500 to-rose-600',
    category: 'broadcast',
    firstAvailableYear: 1995,
    description: 'Canales regionales públicos y privados locales (Teleantioquia, Telepacífico, Canal Trece, etc.).'
  },
  revistas: {
    key: 'revistas',
    label: 'Revistas Impresas',
    shortLabel: 'Revistas',
    color: '#f43f5e', // Rose
    gradient: 'from-rose-500 to-red-600',
    category: 'print',
    firstAvailableYear: 1995,
    description: 'Publicaciones periódicas impresas especializadas y de interés general.'
  }
};

export const RAW_AD_DATA: RawAdRecord[] = [
  { year: 1995, tvRegional: 22969.6, revistas: 32751.2, pubExterior: null, prensa: null, radio: null, tvNacional: 198962.4, digital: null, totalInv: 254683.1, ipc: 19.5, trm: 912.90, internetPenetration: 0.1, population: 36229830 },
  { year: 1996, tvRegional: 22347.2, revistas: 35404.7, pubExterior: null, prensa: null, radio: null, tvNacional: 229243.1, digital: null, totalInv: 286995.0, ipc: 21.6, trm: 1002.94, internetPenetration: 0.3, population: 36830574 },
  { year: 1997, tvRegional: 22268.0, revistas: 40055.5, pubExterior: null, prensa: null, radio: null, tvNacional: 286168.8, digital: null, totalInv: 348492.3, ipc: 17.7, trm: 1115.69, internetPenetration: 0.5, population: 37426532 },
  { year: 1998, tvRegional: 27846.2, revistas: 47905.3, pubExterior: null, prensa: null, radio: 224890.9, tvNacional: 304204.9, digital: null, totalInv: 604847.3, ipc: 16.7, trm: 1402.92, internetPenetration: 1.2, population: 38012359 },
  { year: 1999, tvRegional: 19016.6, revistas: 46349.0, pubExterior: null, prensa: null, radio: 172073.2, tvNacional: 327958.1, digital: null, totalInv: 565396.9, ipc: 9.2, trm: 1776.00, internetPenetration: 1.8, population: 38585016 },
  { year: 2000, tvRegional: 24330.8, revistas: 53527.7, pubExterior: null, prensa: null, radio: 188868.2, tvNacional: 374799.9, digital: null, totalInv: 641526.6, ipc: 8.8, trm: 2087.73, internetPenetration: 3.0, population: 39140080 },
  { year: 2001, tvRegional: 22420.3, revistas: 50546.1, pubExterior: null, prensa: null, radio: 175153.2, tvNacional: 430507.5, digital: null, totalInv: 678627.1, ipc: 7.7, trm: 2299.24, internetPenetration: 4.5, population: 39674811 },
  { year: 2002, tvRegional: 30265.3, revistas: 53648.0, pubExterior: null, prensa: null, radio: 192641.8, tvNacional: 452990.7, digital: null, totalInv: 729545.9, ipc: 7.0, trm: 2361.07, internetPenetration: 5.8, population: 40190679 },
  { year: 2003, tvRegional: 32552.0, revistas: 61775.0, pubExterior: null, prensa: 307647.0, radio: 209554.0, tvNacional: 518029.0, digital: null, totalInv: 1129557.0, ipc: 6.5, trm: 2877.19, internetPenetration: 7.2, population: 40693254 },
  { year: 2004, tvRegional: 34035.0, revistas: 70553.0, pubExterior: null, prensa: 320890.0, radio: 222096.0, tvNacional: 584915.0, digital: null, totalInv: 1232489.0, ipc: 5.5, trm: 2607.87, internetPenetration: 9.3, population: 41188093 },
  { year: 2005, tvRegional: 36742.0, revistas: 83440.0, pubExterior: null, prensa: 353131.0, radio: 257508.0, tvNacional: 673410.0, digital: null, totalInv: 1404231.0, ipc: 4.9, trm: 2320.08, internetPenetration: 12.1, population: 41671878 },
  { year: 2006, tvRegional: 47228.0, revistas: 105912.0, pubExterior: null, prensa: 414077.0, radio: 294505.0, tvNacional: 763408.0, digital: null, totalInv: 1625130.0, ipc: 4.5, trm: 2358.38, internetPenetration: 15.0, population: 42170126 },
  { year: 2007, tvRegional: 59306.0, revistas: 118890.0, pubExterior: null, prensa: 526803.0, radio: 345592.0, tvNacional: 863885.0, digital: null, totalInv: 1914476.0, ipc: 5.7, trm: 2000.06, internetPenetration: 18.4, population: 42658630 },
  { year: 2008, tvRegional: 58633.0, revistas: 108196.0, pubExterior: null, prensa: 496891.0, radio: 352518.0, tvNacional: 858225.0, digital: 40601.0, totalInv: 1915064.0, ipc: 7.7, trm: 1969.95, internetPenetration: 22.6, population: 43134017 },
  { year: 2009, tvRegional: 58794.0, revistas: 93488.0, pubExterior: null, prensa: 478655.0, radio: 365762.0, tvNacional: 823611.0, digital: 50016.0, totalInv: 1870326.0, ipc: 2.0, trm: 2147.81, internetPenetration: 27.0, population: 43608630 },
  { year: 2010, tvRegional: 65275.0, revistas: 99876.0, pubExterior: null, prensa: 536026.0, radio: 419008.0, tvNacional: 919366.0, digital: 94682.0, totalInv: 2134233.0, ipc: 3.2, trm: 1897.74, internetPenetration: 32.5, population: 44086292 },
  { year: 2011, tvRegional: 61702.0, revistas: 109519.0, pubExterior: null, prensa: 599099.0, radio: 443469.0, tvNacional: 1020467.0, digital: 126366.0, totalInv: 2360622.0, ipc: 3.7, trm: 1848.06, internetPenetration: 37.9, population: 44553416 },
  { year: 2012, tvRegional: 63394.0, revistas: 110206.0, pubExterior: null, prensa: 607059.0, radio: 466508.0, tvNacional: 1043509.0, digital: 162205.0, totalInv: 2452881.0, ipc: 2.4, trm: 1768.23, internetPenetration: 42.0, population: 45001571 },
  { year: 2013, tvRegional: 66569.0, revistas: 108706.0, pubExterior: null, prensa: 637900.0, radio: 521607.0, tvNacional: 1098966.0, digital: 215507.0, totalInv: 2649255.0, ipc: 1.9, trm: 1868.90, internetPenetration: 47.1, population: 45434942 },
  { year: 2014, tvRegional: 71644.0, revistas: 103048.0, pubExterior: 145738.0, prensa: 636192.0, radio: 550216.0, tvNacional: 1155026.0, digital: 255389.0, totalInv: 2917253.0, ipc: 3.7, trm: 2000.36, internetPenetration: 51.6, population: 45866010 },
  { year: 2015, tvRegional: 71228.0, revistas: 95061.0, pubExterior: 145885.0, prensa: 574232.0, radio: 561034.0, tvNacional: 1102929.0, digital: 376110.0, totalInv: 2926479.0, ipc: 6.8, trm: 2747.73, internetPenetration: 57.2, population: 46313898 },
  { year: 2016, tvRegional: 56371.0, revistas: 77516.0, pubExterior: 130590.0, prensa: 503065.0, radio: 517723.0, tvNacional: 990127.0, digital: 409739.0, totalInv: 2685131.0, ipc: 5.8, trm: 2977.77, internetPenetration: 63.0, population: 46830116 },
  { year: 2017, tvRegional: 51899.0, revistas: 71067.0, pubExterior: 181973.0, prensa: 465685.0, radio: 528459.0, tvNacional: 917494.0, digital: 600476.0, totalInv: 2817053.0, ipc: 4.1, trm: 2951.00, internetPenetration: 66.5, population: 47419200 },
  { year: 2018, tvRegional: 52374.0, revistas: 59988.0, pubExterior: 184168.0, prensa: 418083.0, radio: 549185.0, tvNacional: 889760.0, digital: 848594.0, totalInv: 3002152.0, ipc: 3.2, trm: 2956.00, internetPenetration: 68.4, population: 48258494 },
  { year: 2019, tvRegional: 60717.0, revistas: 48036.0, pubExterior: 209888.0, prensa: 376697.0, radio: 541920.0, tvNacional: 889057.0, digital: 1080535.0, totalInv: 3206850.0, ipc: 3.8, trm: 3281.00, internetPenetration: 70.9, population: 49395678 },
  { year: 2020, tvRegional: 56101.0, revistas: 19606.0, pubExterior: 82238.0, prensa: 225403.0, radio: 373737.0, tvNacional: 763423.0, digital: 1251333.0, totalInv: 2771841.0, ipc: 1.6, trm: 3693.00, internetPenetration: 72.0, population: 50407647 },
  { year: 2021, tvRegional: 69995.0, revistas: 14732.0, pubExterior: 166607.0, prensa: 253875.0, radio: 499184.0, tvNacional: 1037067.0, digital: 2040158.0, totalInv: 4081618.0, ipc: 5.6, trm: 3743.00, internetPenetration: 75.2, population: 51117378 },
  { year: 2022, tvRegional: 70900.0, revistas: 11470.0, pubExterior: 274741.0, prensa: 269501.0, radio: 578788.0, tvNacional: 1043937.0, digital: 2354697.9, totalInv: 4604034.9, ipc: 13.1, trm: 4255.44, internetPenetration: 76.8, population: 51682692 },
  { year: 2023, tvRegional: 59038.0, revistas: 10513.0, pubExterior: 279346.0, prensa: 246444.0, radio: 578117.0, tvNacional: 975070.0, digital: 2663179.0, totalInv: 4811707.0, ipc: 9.3, trm: 4325.05, internetPenetration: 77.3, population: 52314000 },
  { year: 2024, tvRegional: 52116.3, revistas: 8622.2, pubExterior: 292696.0, prensa: 215570.0, radio: 558882.4, tvNacional: 955310.3, digital: 2825565.2, totalInv: 4908762.4, ipc: 5.2, trm: 4072.59, internetPenetration: 75.7, population: 52695952 },
  { year: 2025, tvRegional: 61114.8, revistas: 6839.0, pubExterior: 328924.6, prensa: 206962.0, radio: 560706.3, tvNacional: 908657.0, digital: 3066685.3, totalInv: 5139889.1, ipc: 5.1, trm: 4052.86, internetPenetration: 82.3, population: 53368000 }
];

export const ALL_MEDIA_KEYS: MediumKey[] = [
  'digital',
  'tvNacional',
  'radio',
  'pubExterior',
  'prensa',
  'tvRegional',
  'revistas'
];

/**
 * Calculates cumulative price deflator with Base Year 2025 = 100.
 * Deflator for year t converts Nominal COP in year t to Constant 2025 COP.
 */
export function calculateCumulativeDeflators(data: RawAdRecord[]): Record<number, number> {
  const deflators: Record<number, number> = {};
  deflators[2025] = 1.0;

  // Walk backwards from 2025 to 1995:
  // P_{t} = P_{t+1} / (1 + IPC_{t+1} / 100)
  for (let yr = 2024; yr >= 1995; yr--) {
    const nextYearRecord = data.find(d => d.year === yr + 1);
    const inflationNextYear = nextYearRecord ? nextYearRecord.ipc : 5.0;
    deflators[yr] = deflators[yr + 1] / (1 + inflationNextYear / 100);
  }

  // Deflator ratio to multiply nominal by: 1.0 / deflator[yr]
  // Because 100 pesos in 1995 is worth 100 * (P_2025 / P_1995) in 2025
  const conversionMultiplier: Record<number, number> = {};
  for (const d of data) {
    conversionMultiplier[d.year] = 1.0 / (deflators[d.year] || 1.0);
  }

  return conversionMultiplier;
}

export function processAdvertisingData(): ProcessedAdRecord[] {
  const deflatorMultipliers = calculateCumulativeDeflators(RAW_AD_DATA);

  return RAW_AD_DATA.map((row, idx, arr) => {
    const prevRow = idx > 0 ? arr[idx - 1] : null;
    const realMultiplier = deflatorMultipliers[row.year] || 1.0;

    const shares: Record<MediumKey, number> = {} as any;
    const realValues: Record<MediumKey, number | null> = {} as any;
    const usdValues: Record<MediumKey, number | null> = {} as any;
    const yoyGrowthByMedium: Record<MediumKey, number | null> = {} as any;

    let sumMediums = 0;

    ALL_MEDIA_KEYS.forEach(key => {
      const val = row[key];
      if (val !== null && val !== undefined) {
        sumMediums += val;
        shares[key] = (val / row.totalInv) * 100;
        realValues[key] = val * realMultiplier;
        usdValues[key] = val / row.trm;

        if (prevRow && prevRow[key] !== null && prevRow[key] !== undefined && prevRow[key]! > 0) {
          yoyGrowthByMedium[key] = ((val - prevRow[key]!) / prevRow[key]!) * 100;
        } else {
          yoyGrowthByMedium[key] = null;
        }
      } else {
        shares[key] = 0;
        realValues[key] = null;
        usdValues[key] = null;
        yoyGrowthByMedium[key] = null;
      }
    });

    const yoyGrowthTotal = prevRow ? ((row.totalInv - prevRow.totalInv) / prevRow.totalInv) * 100 : null;
    const realTotalInv = row.totalInv * realMultiplier;
    const totalInvUSD = row.totalInv / row.trm;
    const adSpendPerCapitaCOP = (row.totalInv * 1_000_000) / row.population;
    const adSpendPerCapitaUSD = (totalInvUSD * 1_000_000) / row.population;

    return {
      ...row,
      totalInvCalculated: sumMediums,
      realTotalInv,
      totalInvUSD,
      adSpendPerCapitaCOP,
      adSpendPerCapitaUSD,
      shares,
      realValues,
      usdValues,
      yoyGrowthTotal,
      yoyGrowthByMedium
    };
  });
}

export const PROCESSED_DATA: ProcessedAdRecord[] = processAdvertisingData();

export const MILESTONES = [
  {
    year: 1998,
    title: 'Ingreso Medición de Radio',
    description: 'Comienza el registro formal y consolidado de pauta radial por entidades gremiales en Colombia.',
    impact: 'Expansión de la cobertura del mercado publicitario.',
    category: 'regulatory'
  },
  {
    year: 2003,
    title: 'Medición Consolidada de Prensa',
    description: 'Se integra la pauta de diarios y periódicos impresos al índice de inversión total.',
    impact: 'Prensa representó más del 27% del mercado total.',
    category: 'regulatory'
  },
  {
    year: 2008,
    title: 'Aparición de la Pauta Digital',
    description: 'Primer registro de inversión publicitaria online con 40.601 millones COP (2,1% del total).',
    impact: 'Punto de partida de la mayor transformación tecnológica del sector.',
    category: 'market'
  },
  {
    year: 2014,
    title: 'Inclusión de Publicidad Exterior (OOH)',
    description: 'Integración sistemática de vallas y mobiliario urbano (145.738 millones COP). La TV Nacional alcanza su pico histórico en pauta (1,15 billones COP).',
    impact: 'Diversificación del mix de medios.',
    category: 'market'
  },
  {
    year: 2020,
    title: 'Impacto COVID-19 y Quiebre Estructural',
    description: 'Caída general del gasto publicitario exterior (-55%) y prensa (-40%). Digital acelera adopción y amortigua la crisis sanitaria.',
    impact: 'Aceleración forzosa del comercio electrónico y pauta programática.',
    category: 'shock'
  },
  {
    year: 2021,
    title: 'Sorpasso Digital: Digital supera a la TV',
    description: 'Por primera vez en la historia de Colombia, Digital supera a la TV Nacional (2,04 billones vs 1,03 billones COP).',
    impact: 'Digital toma la hegemonía publicitaria definitiva superando el 50% de cuota.',
    category: 'market'
  },
  {
    year: 2025,
    title: 'Digital alcanza 59,7% y Mercado supera 5,1 Billones',
    description: 'Inversión digital sobrepasa los 3 billones COP. Publicidad exterior DOOH crece a 328 mil millones COP.',
    impact: 'Consolidación de un ecosistema omnicanal con predominancia digital absoluta.',
    category: 'market'
  }
];
