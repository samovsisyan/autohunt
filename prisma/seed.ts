import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { computeEstimate, type CalculatorConfig, type EstimateInput } from "../src/server/calculator/engine";
import { cars, describe } from "./seed-data/cars";
import { posts } from "./seed-data/blog";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const days = (n: number) => new Date(Date.now() - n * 86_400_000);
const L = (hy: string, ru: string, en: string) => ({ hy, ru, en });

// ───────────── Calculator configuration (sample values — edit in /admin/calculator) ─────────────

const auctionTiers = {
  COPART: [
    [0, 999, 390, 0],
    [1000, 1999, 560, 0],
    [2000, 3999, 780, 0],
    [4000, 5999, 930, 0],
    [6000, 7999, 1030, 0],
    [8000, 9999, 1080, 0],
    [10000, 14999, 1100, 0],
    [15000, null, 250, 6],
  ],
  IAAI: [
    [0, 999, 370, 0],
    [1000, 1999, 540, 0],
    [2000, 3999, 760, 0],
    [4000, 5999, 900, 0],
    [6000, 7999, 1000, 0],
    [8000, 9999, 1060, 0],
    [10000, 14999, 1080, 0],
    [15000, null, 240, 5.75],
  ],
} as const;

const vehicleTypes = [
  { code: "SEDAN", name: L("Սեդան / հեչբեք", "Седан / хэтчбек", "Sedan / hatchback") },
  { code: "CROSSOVER", name: L("Քրոսովեր", "Кроссовер", "Crossover") },
  { code: "SUV", name: L("Ամենագնաց / մինիվեն", "Внедорожник / минивэн", "SUV / minivan") },
  { code: "PICKUP", name: L("Պիկապ", "Пикап", "Pickup") },
];

// [vehicleType, inland, ocean, land] per origin; Yerevan adds +90 land delivery vs Gyumri
const shippingBase: Record<string, [string, number, number, number][]> = {
  US: [
    ["SEDAN", 700, 1250, 250],
    ["CROSSOVER", 750, 1400, 260],
    ["SUV", 800, 1550, 300],
    ["PICKUP", 900, 1750, 320],
  ],
  CA: [
    ["SEDAN", 850, 1400, 250],
    ["CROSSOVER", 900, 1550, 260],
    ["SUV", 950, 1700, 300],
    ["PICKUP", 1050, 1900, 320],
  ],
};

const customsRules = [
  { name: "Electric vehicles — duty exempt", fuelTypes: ["ELECTRIC"], minAge: 0, maxAge: null, dutyPercent: 0, dutyPerCcEur: 0, vatPercent: 0, processingFee: 60, priority: 10, notes: "Verify the current EV VAT/duty exemption status before each season." },
  { name: "Up to 3 years", fuelTypes: [], minAge: 0, maxAge: 3, dutyPercent: 15, dutyPerCcEur: 0.25, vatPercent: 20, processingFee: 60, priority: 20 },
  { name: "3–7 years", fuelTypes: [], minAge: 4, maxAge: 7, dutyPercent: 15, dutyPerCcEur: 0.35, vatPercent: 20, processingFee: 60, priority: 30 },
  { name: "Over 7 years, up to 2.5 L", fuelTypes: [], minAge: 8, maxAge: null, maxEngineCc: 2500, dutyPercent: 15, dutyPerCcEur: 0.5, vatPercent: 20, processingFee: 60, priority: 40 },
  { name: "Over 7 years, above 2.5 L", fuelTypes: [], minAge: 8, maxAge: null, minEngineCc: 2501, dutyPercent: 20, dutyPerCcEur: 0.6, vatPercent: 20, processingFee: 60, priority: 50 },
] as const;

const feeRules = [
  { key: "broker_documentation", name: L("Բրոքեր և փաստաթղթեր", "Брокер и документы", "Broker & documentation"), category: "DOCUMENTATION", type: "FIXED", amount: 250, sortOrder: 1 },
  { key: "registration", name: L("Հաշվառում և համարանիշեր", "Регистрация и номера", "Registration & plates"), category: "REGISTRATION", type: "FIXED", amount: 150, sortOrder: 2 },
  { key: "service_fee", name: L("AutoHunt ծառայություն", "Услуги AutoHunt", "AutoHunt service"), category: "SERVICE", type: "PERCENT", basis: "CAR_PRICE", amount: 3, minAmount: 450, maxAmount: 1200, sortOrder: 3 },
] as const;

const rates = { AMD: 385, EUR: 0.86, RUB: 82 };

function engineConfig(): CalculatorConfig {
  return {
    auctions: Object.fromEntries(
      Object.entries(auctionTiers).map(([code, tiers]) => [
        code,
        tiers.map(([minPrice, maxPrice, fixedFee, percentFee]) => ({ minPrice, maxPrice, fixedFee, percentFee })),
      ]),
    ),
    shipping: Object.entries(shippingBase).flatMap(([origin, rows]) =>
      ["GYUMRI", "YEREVAN"].flatMap((destination) =>
        rows.map(([vehicleType, inland, ocean, land]) => ({
          origin,
          destination,
          vehicleType,
          inlandTransport: inland,
          oceanShipping: ocean,
          landDelivery: destination === "YEREVAN" ? land + 90 : land,
        })),
      ),
    ),
    customs: customsRules.map((r, i) => ({
      id: String(i),
      name: r.name,
      fuelTypes: [...r.fuelTypes],
      minAge: r.minAge,
      maxAge: r.maxAge,
      minEngineCc: "minEngineCc" in r ? r.minEngineCc : 0,
      maxEngineCc: "maxEngineCc" in r ? r.maxEngineCc : null,
      dutyPercent: r.dutyPercent,
      dutyPerCcEur: r.dutyPerCcEur,
      exciseFixed: 0,
      vatPercent: r.vatPercent,
      processingFee: r.processingFee,
      priority: r.priority,
    })),
    fees: feeRules.map((f) => ({
      key: f.key,
      category: f.category,
      type: f.type,
      basis: "basis" in f ? f.basis : "CAR_PRICE",
      amount: f.amount,
      minAmount: "minAmount" in f ? f.minAmount : null,
      maxAmount: "maxAmount" in f ? f.maxAmount : null,
      sortOrder: f.sortOrder,
    })),
    rates,
    customsBaseIncludesShipping: true,
    referenceYear: new Date().getFullYear(),
    ratesUpdatedAt: new Date().toISOString(),
  };
}

async function seedCalculator() {
  const origins = [
    { code: "US", name: L("ԱՄՆ", "США", "USA"), sortOrder: 1 },
    { code: "CA", name: L("Կանադա", "Канада", "Canada"), sortOrder: 2 },
  ];
  const destinations = [
    { code: "GYUMRI", name: L("Գյումրի", "Гюмри", "Gyumri"), sortOrder: 1 },
    { code: "YEREVAN", name: L("Երևան", "Ереван", "Yerevan"), sortOrder: 2 },
  ];

  let sort = 0;
  for (const [code, tiers] of Object.entries(auctionTiers)) {
    await db.auction.create({
      data: {
        code,
        name: code === "COPART" ? "Copart" : "IAAI",
        sortOrder: sort++,
        feeTiers: {
          create: tiers.map(([minPrice, maxPrice, fixedFee, percentFee]) => ({ minPrice, maxPrice, fixedFee, percentFee })),
        },
      },
    });
  }
  const originRows = await Promise.all(origins.map((o) => db.originCountry.create({ data: o })));
  const destRows = await Promise.all(destinations.map((d) => db.destination.create({ data: d })));
  const vtRows = await Promise.all(vehicleTypes.map((v, i) => db.vehicleType.create({ data: { ...v, sortOrder: i } })));

  const cfg = engineConfig();
  await db.shippingRate.createMany({
    data: cfg.shipping.map((s) => ({
      originId: originRows.find((o) => o.code === s.origin)!.id,
      destinationId: destRows.find((d) => d.code === s.destination)!.id,
      vehicleTypeId: vtRows.find((v) => v.code === s.vehicleType)!.id,
      inlandTransport: s.inlandTransport,
      oceanShipping: s.oceanShipping,
      landDelivery: s.landDelivery,
    })),
  });

  await db.customsRule.createMany({
    data: customsRules.map((r) => ({ ...r, fuelTypes: [...r.fuelTypes] })),
  });
  await db.feeRule.createMany({ data: feeRules.map((f) => ({ ...f })) });
  await db.exchangeRate.createMany({ data: Object.entries(rates).map(([code, perUsd]) => ({ code, perUsd })) });
  await db.setting.create({ data: { key: "calculator", value: { customsBaseIncludesShipping: true, referenceYear: null } } });
  await db.setting.create({ data: { key: "locales", value: { enabled: ["hy", "ru", "en"], default: "hy" } } });
}

// ───────────── Content ─────────────

const faq = {
  en: [
    { q: "How long does it take to import a car from the USA to Armenia?", a: "Usually 45–60 days from the auction to hand-over: about 1 week for pickup, 30–45 days of shipping to Poti and 5–10 days for delivery, customs and registration." },
    { q: "Is the calculator price final?", a: "No — it's an estimate built from our current rates. Customs value is confirmed by the official assessment and exchange rates change. In your dashboard we always show estimated and final cost separately." },
    { q: "Can I buy a car at Copart without a dealer license?", a: "Most lots require one. AutoHunt bids on your behalf with our dealer accounts, within the maximum you approve." },
    { q: "Do you import damaged cars?", a: "Yes. We help evaluate damage from photos and history reports and can organize repair in Armenia. For many buyers, lightly damaged cars offer the best value." },
    { q: "How do payments work?", a: "Typically: a deposit before bidding, the car price after winning, and customs/registration on arrival. Everything is tracked in your dashboard." },
    { q: "Do you work with companies?", a: "Yes — we source and import vehicles for businesses and fleets, with VAT invoices and a dedicated manager." },
  ],
  ru: [
    { q: "Сколько времени занимает пригон авто из США в Армению?", a: "Обычно 45–60 дней от аукциона до выдачи: около недели на забор, 30–45 дней доставки до Поти и 5–10 дней на доставку, таможню и регистрацию." },
    { q: "Цена в калькуляторе окончательная?", a: "Нет — это оценка по нашим текущим тарифам. Таможенная стоимость подтверждается официально, а курсы меняются. В кабинете мы показываем предварительную и финальную стоимость отдельно." },
    { q: "Можно ли купить на Copart без дилерской лицензии?", a: "Для большинства лотов она нужна. AutoHunt делает ставки за вас через наши дилерские аккаунты в пределах согласованного бюджета." },
    { q: "Вы привозите повреждённые авто?", a: "Да. Помогаем оценить повреждения по фото и истории и можем организовать ремонт в Армении." },
    { q: "Как происходит оплата?", a: "Обычно: депозит до торгов, стоимость авто после победы, таможня и регистрация по прибытии. Всё отражается в кабинете." },
    { q: "Работаете ли вы с компаниями?", a: "Да — подбираем и импортируем авто для бизнеса и автопарков, с НДС-счетами и персональным менеджером." },
  ],
  hy: [
    { q: "Որքա՞ն ժամանակ է տևում մեքենայի ներմուծումը ԱՄՆ-ից Հայաստան", a: "Սովորաբար 45–60 օր աճուրդից մինչև հանձնում՝ մոտ 1 շաբաթ վերցնելու համար, 30–45 օր առաքում մինչև Փոթի և 5–10 օր՝ առաքում, մաքսազերծում և հաշվառում։" },
    { q: "Հաշվիչի գինը վերջնակա՞ն է", a: "Ոչ, դա նախնական հաշվարկ է մեր գործող սակագներով։ Մաքսային արժեքը հաստատվում է պաշտոնական գնահատմամբ, իսկ փոխարժեքները փոխվում են։ Անձնական էջում միշտ առանձին ենք ցույց տալիս նախնական և վերջնական արժեքները։" },
    { q: "Կարո՞ղ եմ գնել Copart-ում առանց դիլերային լիցենզիայի", a: "Լոտերի մեծ մասի համար այն անհրաժեշտ է։ AutoHunt-ը խաղադրույք է կատարում ձեր անունից՝ մեր դիլերային հաշիվներով։" },
    { q: "Ներմուծո՞ւմ եք վնասված մեքենաներ", a: "Այո։ Օգնում ենք գնահատել վնասները լուսանկարներով և պատմությամբ և կարող ենք կազմակերպել վերանորոգում Հայաստանում։" },
    { q: "Ինչպե՞ս է կատարվում վճարումը", a: "Սովորաբար՝ կանխավճար մինչև աճուրդը, մեքենայի գինը՝ հաղթելուց հետո, մաքսն ու հաշվառումը՝ ժամանելուն պես։ Ամեն ինչ արտացոլվում է անձնական էջում։" },
    { q: "Աշխատո՞ւմ եք ընկերությունների հետ", a: "Այո՝ ընտրում և ներմուծում ենք մեքենաներ բիզնեսի և ավտոպարկերի համար՝ ԱԱՀ հաշիվ-ապրանքագրերով և անհատական մենեջերով։" },
  ],
};

const contact = {
  en: { phone: "+374 55 123 456", whatsapp: "+37455123456", email: "info@autohunt.am", address: "12 Vardanants St, Gyumri, Armenia", hours: "Mon–Sat, 10:00–19:00", instagram: "https://instagram.com/autohunt.am", facebook: "https://facebook.com/autohunt.am", telegram: "" },
  ru: { phone: "+374 55 123 456", whatsapp: "+37455123456", email: "info@autohunt.am", address: "ул. Вардананц 12, Гюмри, Армения", hours: "Пн–Сб, 10:00–19:00", instagram: "https://instagram.com/autohunt.am", facebook: "https://facebook.com/autohunt.am", telegram: "" },
  hy: { phone: "+374 55 123 456", whatsapp: "+37455123456", email: "info@autohunt.am", address: "Վարդանանց 12, Գյումրի, Հայաստան", hours: "Երկ–Շբթ, 10:00–19:00", instagram: "https://instagram.com/autohunt.am", facebook: "https://facebook.com/autohunt.am", telegram: "" },
};

// ───────────── Main ─────────────

async function main() {
  console.log("Resetting data…");
  // Order matters for FK constraints
  await db.$transaction([
    db.notification.deleteMany(),
    db.document.deleteMany(),
    db.importEvent.deleteMany(),
    db.import.deleteMany(),
    db.request.deleteMany(),
    db.calculation.deleteMany(),
    db.carDocument.deleteMany(),
    db.carImage.deleteMany(),
    db.carTranslation.deleteMany(),
    db.car.deleteMany(),
    db.user.deleteMany(),
    db.shippingRate.deleteMany(),
    db.auctionFeeTier.deleteMany(),
    db.auction.deleteMany(),
    db.originCountry.deleteMany(),
    db.destination.deleteMany(),
    db.vehicleType.deleteMany(),
    db.customsRule.deleteMany(),
    db.feeRule.deleteMany(),
    db.exchangeRate.deleteMany(),
    db.blogPostTranslation.deleteMany(),
    db.blogPost.deleteMany(),
    db.siteContent.deleteMany(),
    db.seoEntry.deleteMany(),
    db.setting.deleteMany(),
  ]);

  console.log("Calculator configuration…");
  await seedCalculator();
  const cfg = engineConfig();

  console.log("Users…");
  const [adminHash, demoHash] = await Promise.all([bcrypt.hash("admin1234", 12), bcrypt.hash("demo1234", 12)]);
  await db.user.create({ data: { email: "admin@autohunt.am", name: "AutoHunt Admin", passwordHash: adminHash, role: "ADMIN", locale: "en" } });
  const customer = await db.user.create({
    data: { email: "customer@autohunt.am", name: "Armen Petrosyan", phone: "+374 77 555 010", passwordHash: demoHash, role: "CUSTOMER", locale: "hy" },
  });
  const corporate = await db.user.create({
    data: { email: "corporate@autohunt.am", name: "Anna Mkrtchyan", phone: "+374 91 200 300", passwordHash: demoHash, role: "CORPORATE", companyName: "Shirak Logistics LLC", companyTaxId: "02612345", locale: "ru" },
  });

  console.log("Cars…");
  const carIds: Record<string, string> = {};
  for (const c of cars) {
    const created = await db.car.create({
      data: {
        slug: c.slug,
        brand: c.brand,
        model: c.model,
        trim: c.trim,
        year: c.year,
        mileage: c.mileage,
        mileageUnit: c.mileageUnit ?? "MI",
        engineVolume: c.engineVolume,
        horsepower: c.horsepower,
        fuel: c.fuel,
        transmission: c.transmission,
        drive: c.drive,
        bodyType: c.bodyType,
        color: c.color,
        interior: c.interior,
        vin: c.vin,
        price: c.price,
        location: c.location,
        source: c.source,
        status: c.status ?? "AVAILABLE",
        featured: c.featured ?? false,
        features: c.features,
        history: c.history,
        createdAt: days(c.daysAgo),
        images: { create: c.images.map((url, i) => ({ url, alt: `${c.year} ${c.brand} ${c.model}`, sortOrder: i })) },
        translations: {
          create: (["hy", "ru", "en"] as const).map((locale) => ({ locale, description: describe(c, locale) })),
        },
        documents: c.history.lotNumber
          ? {
              create: [
                { title: "Auction sheet", url: "/docs/sample-document.pdf", type: "AUCTION_SHEET" },
                { title: "Vehicle history report", url: "/docs/sample-document.pdf", type: "VEHICLE_HISTORY" },
              ],
            }
          : undefined,
      },
    });
    carIds[c.slug] = created.id;
  }

  console.log("Imports & customer data…");
  const copart = await db.auction.findUniqueOrThrow({ where: { code: "COPART" } });
  const iaai = await db.auction.findUniqueOrThrow({ where: { code: "IAAI" } });
  const stages = ["AUCTION", "PURCHASED", "PICKED_UP", "AT_PORT", "SHIPPING", "ARRIVED", "CUSTOMS", "REGISTRATION", "READY"] as const;
  const stageInfo: Record<string, { location: string; note?: string }> = {
    AUCTION: { location: "Copart — Newark, NJ" },
    PURCHASED: { location: "Newark, NJ", note: "Won at $12,500 · invoice paid" },
    PICKED_UP: { location: "Newark, NJ → Port Elizabeth", note: "Carrier: East Coast Auto Transport" },
    AT_PORT: { location: "Port Elizabeth, NJ", note: "Loaded into container MSKU 482193-0" },
    SHIPPING: { location: "Atlantic Ocean → Poti, Georgia", note: "Vessel: MSC Aurora · ETA Poti in 12 days" },
    ARRIVED: { location: "Poti → Gyumri" },
    CUSTOMS: { location: "Gyumri customs terminal" },
    REGISTRATION: { location: "Gyumri, Road Police" },
    READY: { location: "AutoHunt, Gyumri" },
  };

  async function createImport(opts: {
    code: string;
    customerId: string;
    title: string;
    year: number;
    image: string;
    vin: string;
    lot: string;
    auctionId: string;
    input: EstimateInput;
    current: (typeof stages)[number];
    paid: number;
    startDaysAgo: number;
    final?: boolean;
    carSlug?: string;
  }) {
    const estimate = computeEstimate(opts.input, cfg);
    const currentIdx = stages.indexOf(opts.current);
    const done = opts.current === "READY";
    return db.import.create({
      data: {
        code: opts.code,
        customerId: opts.customerId,
        carId: opts.carSlug ? carIds[opts.carSlug] : undefined,
        vehicleTitle: opts.title,
        vehicleYear: opts.year,
        imageUrl: opts.image,
        vin: opts.vin,
        lotNumber: opts.lot,
        auctionId: opts.auctionId,
        purchasePrice: opts.input.price,
        estimatedTotal: estimate.total,
        finalTotal: opts.final ? estimate.total + 180 : null,
        paidAmount: opts.paid,
        currentStage: opts.current,
        breakdown: estimate as object,
        createdAt: days(opts.startDaysAgo),
        events: {
          create: stages.map((stage, i) => ({
            stage,
            status: done || i < currentIdx ? "DONE" : i === currentIdx ? "CURRENT" : "PENDING",
            date: i <= currentIdx ? days(opts.startDaysAgo - i * Math.floor(opts.startDaysAgo / (currentIdx + 1.5))) : null,
            location: i <= currentIdx ? stageInfo[stage].location : null,
            note: i <= currentIdx ? stageInfo[stage].note : null,
          })),
        },
      },
    });
  }

  const camry = await createImport({
    code: "AH-2026-0142",
    customerId: customer.id,
    title: "Toyota Camry SE Hybrid",
    year: 2022,
    image: "/images/cars/toyota-camry.jpg",
    vin: "4T1G31AK5NU067812",
    lot: "54829011",
    auctionId: copart.id,
    input: { auction: "COPART", price: 12500, year: 2022, engine: 2.5, fuel: "HYBRID", vehicleType: "SEDAN", origin: "US", destination: "GYUMRI" },
    current: "SHIPPING",
    paid: 5000,
    startDaysAgo: 34,
  });
  const tesla = await createImport({
    code: "AH-2026-0097",
    customerId: customer.id,
    title: "Tesla Model 3 Long Range",
    year: 2021,
    image: "/images/cars/tesla-model-3-2.jpg",
    vin: "5YJ3E1EB8MF901234",
    lot: "37712290",
    auctionId: iaai.id,
    input: { auction: "IAAI", price: 17800, year: 2021, engine: 0, fuel: "ELECTRIC", vehicleType: "SEDAN", origin: "US", destination: "GYUMRI" },
    current: "READY",
    paid: 0, // set to the final total below
    startDaysAgo: 120,
    final: true,
  });
  await db.import.update({ where: { id: tesla.id }, data: { paidAmount: tesla.finalTotal! } });
  await createImport({
    code: "AH-2026-0188",
    customerId: customer.id,
    title: "Nissan Altima 2.5 SR",
    year: 2021,
    image: "/images/cars/nissan-altima.jpg",
    vin: "1N4BL4CV2MN345678",
    lot: "61177402",
    auctionId: copart.id,
    input: { auction: "COPART", price: 9800, year: 2021, engine: 2.5, fuel: "GASOLINE", vehicleType: "SEDAN", origin: "US", destination: "GYUMRI" },
    current: "PURCHASED",
    paid: 2000,
    startDaysAgo: 6,
  });
  await createImport({
    code: "AH-2026-0151",
    customerId: corporate.id,
    title: "Ford Expedition Limited",
    year: 2019,
    image: "/images/cars/ford-expedition.jpg",
    vin: "1FMJU2AT1KEA90011",
    lot: "33091827",
    auctionId: iaai.id,
    input: { auction: "IAAI", price: 24500, year: 2019, engine: 3.5, fuel: "GASOLINE", vehicleType: "SUV", origin: "US", destination: "YEREVAN" },
    current: "CUSTOMS",
    paid: 20000,
    startDaysAgo: 52,
  });

  await db.document.createMany({
    data: [
      { userId: customer.id, importId: camry.id, title: "Copart invoice #54829011", url: "/docs/sample-document.pdf", type: "INVOICE", createdAt: days(32) },
      { userId: customer.id, importId: camry.id, title: "Bill of sale", url: "/docs/sample-document.pdf", type: "BILL_OF_SALE", createdAt: days(31) },
      { userId: customer.id, importId: camry.id, title: "Bill of lading MSKU4821930", url: "/docs/sample-document.pdf", type: "BILL_OF_LADING", createdAt: days(18) },
      { userId: customer.id, importId: tesla.id, title: "Customs declaration", url: "/docs/sample-document.pdf", type: "CUSTOMS", createdAt: days(40) },
      { userId: customer.id, importId: tesla.id, title: "Registration certificate", url: "/docs/sample-document.pdf", type: "REGISTRATION", createdAt: days(35) },
    ],
  });

  await db.notification.createMany({
    data: [
      { userId: customer.id, title: "Your Camry is at sea", body: "Container MSKU 482193-0 departed Port Elizabeth. ETA Poti in 12 days.", link: "/dashboard/imports/" + camry.id, createdAt: days(1) },
      { userId: customer.id, title: "Bill of lading uploaded", body: "A new document is available for Toyota Camry SE Hybrid.", link: "/dashboard/documents", createdAt: days(18) },
      { userId: customer.id, title: "Altima purchased", body: "We won lot 61177402 for $9,800 — within your budget.", link: "/dashboard/imports", createdAt: days(5), read: false },
      { userId: customer.id, title: "Tesla delivered", body: "Your Model 3 is registered and ready. Enjoy the drive!", read: true, createdAt: days(35) },
    ],
  });

  const calcInputs: EstimateInput[] = [
    { auction: "COPART", price: 12000, year: 2022, engine: 2.5, fuel: "HYBRID", vehicleType: "SEDAN", origin: "US", destination: "GYUMRI" },
    { auction: "IAAI", price: 21000, year: 2020, engine: 3.0, fuel: "GASOLINE", vehicleType: "CROSSOVER", origin: "US", destination: "YEREVAN" },
  ];
  for (const [i, input] of calcInputs.entries()) {
    await db.calculation.create({
      data: {
        shareId: `demo${i + 1}calc`,
        userId: customer.id,
        label: i === 0 ? "Camry hybrid 2022" : "BMW X5 2020",
        input: input as object,
        result: computeEstimate(input, cfg) as object,
        createdAt: days(40 - i * 10),
      },
    });
  }

  await db.request.createMany({
    data: [
      { type: "CAR_REQUEST", name: "Armen Petrosyan", phone: "+374 77 555 010", email: "customer@autohunt.am", userId: customer.id, carId: carIds["bmw-540i-xdrive-2020"], message: "Is a test drive possible this Saturday?", locale: "hy", createdAt: days(2) },
      { type: "IMPORT", name: "Gor Avetisyan", phone: "+374 93 111 222", payload: { vin: "JTDKN3DU5A0123456", auction: "COPART", budget: "15000" }, locale: "hy", createdAt: days(1) },
      { type: "CAR_SEARCH", name: "Мария Иванова", phone: "+374 98 765 432", email: "maria@example.com", payload: { brand: "Toyota", model: "RAV4", budget: "22000", fuel: "HYBRID" }, locale: "ru", createdAt: days(3), status: "IN_PROGRESS" },
      { type: "CORPORATE", name: "Anna Mkrtchyan", company: "Shirak Logistics LLC", phone: "+374 91 200 300", email: "corporate@autohunt.am", userId: corporate.id, payload: { vehicles: "6", budget: "150000", requirements: "Pickups, 4x4, diesel preferred" }, message: "Fleet renewal for Q1 2027.", locale: "ru", createdAt: days(4), status: "QUOTED" },
      { type: "CONTACT", name: "John Miller", phone: "+1 202 555 0147", email: "john@example.com", message: "Do you ship to Georgia too?", locale: "en", createdAt: days(6), status: "CLOSED" },
    ],
  });

  console.log("Blog…");
  for (const p of posts) {
    await db.blogPost.create({
      data: {
        category: p.category,
        authorName: p.authorName,
        coverImage: p.coverImage,
        publishedAt: days(p.daysAgo),
        translations: {
          create: (["hy", "ru", "en"] as const).map((locale) => ({ locale, ...p[locale] })),
        },
      },
    });
  }

  console.log("Site content…");
  for (const locale of ["hy", "ru", "en"] as const) {
    await db.siteContent.create({ data: { key: "home.faq", locale, data: { items: faq[locale] } } });
    await db.siteContent.create({ data: { key: "site.contact", locale, data: contact[locale] } });
  }
  await db.seoEntry.create({
    data: { path: "/calculator", locale: "en", keywords: "car import calculator armenia, copart to armenia cost, customs calculator armenia" },
  });

  console.log(`Done. Camry estimate: $${computeEstimate(calcInputs[0], cfg).total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
