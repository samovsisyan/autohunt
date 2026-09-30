type Tr = { slug: string; title: string; excerpt: string; content: string; seoTitle?: string; seoDescription?: string };
export interface SeedPost {
  category: "CAR_IMPORT" | "AUCTIONS" | "CUSTOMS" | "CAR_BUYING" | "MAINTENANCE" | "NEWS" | "GUIDES";
  authorName: string;
  coverImage: string;
  daysAgo: number;
  hy: Tr;
  ru: Tr;
  en: Tr;
}

export const posts: SeedPost[] = [
  {
    category: "CAR_IMPORT",
    authorName: "Aram Hakobyan",
    coverImage: "/images/site/fleet.jpg",
    daysAgo: 3,
    en: {
      slug: "how-to-import-a-car-from-copart-to-armenia",
      title: "How to Import a Car from Copart to Armenia",
      seoTitle: "How to Import a Car from Copart to Armenia — Step-by-Step (2026)",
      seoDescription: "A step-by-step guide to buying at Copart and bringing the car to Armenia: bidding, transport, shipping via Poti, customs and registration.",
      excerpt: "From choosing a lot to getting Armenian plates — every step, with realistic timelines and costs.",
      content: `Copart lists more than 200,000 vehicles on any given day. For buyers in Armenia, it's one of the most effective ways to get a newer, better-equipped car for less money than the local market. Here's how the process actually works.

## 1. Choose the right lot

Filter by **title type** (clean, salvage, rebuilt), **primary damage** and **run & drive** status. Always check the photos at full resolution and request a vehicle history report (Carfax or AutoCheck) before bidding.

> Tip: cars with "hail" or "minor dent/scratches" damage often need only cosmetic repair — and sell at a significant discount.

## 2. Bid through a licensed broker

Most Copart lots require a dealer license. AutoHunt bids on your behalf, within the maximum you approve. You'll see the auction fees **before** the auction, not after.

## 3. Pay and pick up

Payment is due within 2–3 business days. Our carrier picks the car up from the yard and brings it to the export port (usually New Jersey, Savannah, Houston or Los Angeles).

## 4. Ocean shipping to Poti

Cars travel in shared containers to **Poti, Georgia** — typically 30–45 days. From Poti the car is delivered by truck to Gyumri or Yerevan.

## 5. Customs and registration

Our broker files the declaration. Duty and VAT depend on the car's value, age, engine volume and fuel type. After clearance, we handle technical inspection and registration.

## How long does it take?

On average **45–60 days** from auction to keys in hand.

## How much does it cost?

It depends on the car — which is exactly why we built the [cost calculator](/en/calculator). Enter the lot price, year and engine and you'll see every line: auction fees, transport, shipping, customs, documents, registration and our service fee.`,
    },
    ru: {
      slug: "kak-prignat-avto-s-copart-v-armeniyu",
      title: "Как пригнать авто с Copart в Армению",
      seoTitle: "Как пригнать авто с Copart в Армению — пошагово (2026)",
      seoDescription: "Пошаговое руководство: покупка на Copart, доставка по США, морская перевозка через Поти, растаможка и регистрация в Армении.",
      excerpt: "От выбора лота до армянских номеров — все шаги с реальными сроками и расходами.",
      content: `На Copart ежедневно выставлено более 200 000 автомобилей. Для покупателей в Армении это один из самых выгодных способов получить более новый и богатый автомобиль дешевле местного рынка.

## 1. Выберите подходящий лот

Фильтруйте по **типу тайтла** (clean, salvage, rebuilt), **основному повреждению** и статусу **run & drive**. Смотрите фото в полном разрешении и запрашивайте историю (Carfax или AutoCheck) до ставки.

> Совет: авто с повреждениями «hail» или «minor dent/scratches» часто требуют только косметики — и продаются с большой скидкой.

## 2. Ставка через брокера

Большинство лотов Copart требуют дилерскую лицензию. AutoHunt делает ставки за вас в пределах согласованного максимума. Сборы аукциона вы видите **до** торгов.

## 3. Оплата и забор

Оплата — в течение 2–3 рабочих дней. Наш перевозчик забирает авто с площадки и доставляет в порт отправки.

## 4. Морская доставка до Поти

Авто идут в контейнерах до **Поти (Грузия)** — обычно 30–45 дней. Далее — автовозом в Гюмри или Ереван.

## 5. Таможня и регистрация

Брокер подаёт декларацию. Пошлина и НДС зависят от стоимости, возраста, объёма двигателя и типа топлива. После выпуска мы проходим техосмотр и регистрацию.

## Сколько это стоит?

Зависит от авто — поэтому мы сделали [калькулятор](/ru/calculator). Введите цену лота, год и двигатель — и увидите каждую строку расходов.`,
    },
    hy: {
      slug: "inchpes-nermucel-meqena-copart-ic-hayastan",
      title: "Ինչպես ներմուծել մեքենա Copart-ից Հայաստան",
      seoTitle: "Ինչպես ներմուծել մեքենա Copart-ից Հայաստան — քայլ առ քայլ (2026)",
      seoDescription: "Քայլ առ քայլ ուղեցույց՝ գնում Copart-ում, տեղափոխում ԱՄՆ-ում, առաքում Փոթիով, մաքսազերծում և հաշվառում Հայաստանում։",
      excerpt: "Լոտի ընտրությունից մինչև հայկական համարանիշեր՝ բոլոր քայլերը իրական ժամկետներով և ծախսերով։",
      content: `Copart-ում ամեն օր ցուցադրվում է ավելի քան 200 000 մեքենա։ Հայաստանում գնորդների համար սա ավելի նոր և հագեցած մեքենա տեղական շուկայից էժան ձեռք բերելու ամենաարդյունավետ ճանապարհներից մեկն է։

## 1. Ընտրեք ճիշտ լոտը

Զտեք ըստ **title-ի տեսակի** (clean, salvage, rebuilt), **հիմնական վնասի** և **run & drive** կարգավիճակի։ Դիտեք լուսանկարները լրիվ չափով և խաղադրույքից առաջ պահանջեք պատմության հաշվետվություն (Carfax կամ AutoCheck)։

> Խորհուրդ՝ «hail» կամ «minor dent/scratches» վնասներով մեքենաները հաճախ պահանջում են միայն կոսմետիկ վերանորոգում և վաճառվում են զգալի զեղչով։

## 2. Խաղադրույք բրոքերի միջոցով

Copart-ի լոտերի մեծ մասը պահանջում է դիլերային լիցենզիա։ AutoHunt-ը խաղադրույք է կատարում ձեր անունից՝ համաձայնեցված առավելագույնի սահմաններում։

## 3. Վճարում և վերցնում

Վճարումը՝ 2–3 աշխատանքային օրվա ընթացքում։ Մեր փոխադրողը մեքենան տեղափոխում է արտահանման նավահանգիստ։

## 4. Ծովային առաքում մինչև Փոթի

Մեքենաները բեռնարկղերով հասնում են **Փոթի (Վրաստան)**՝ սովորաբար 30–45 օրում։ Այնուհետև՝ ավտոփոխադրիչով Գյումրի կամ Երևան։

## 5. Մաքսազերծում և հաշվառում

Բրոքերը ներկայացնում է հայտարարագիրը։ Մաքսատուրքը և ԱԱՀ-ն կախված են արժեքից, տարիքից, շարժիչի ծավալից և վառելիքի տեսակից։

## Որքա՞ն արժե

Կախված է մեքենայից, այդ պատճառով մենք ստեղծել ենք [հաշվիչը](/hy/calculator)։ Մուտքագրեք լոտի գինը, տարին և շարժիչը՝ և կտեսնեք ծախսերի յուրաքանչյուր տողը։`,
    },
  },
  {
    category: "CUSTOMS",
    authorName: "Lilit Grigoryan",
    coverImage: "/images/site/bmw-m4.jpg",
    daysAgo: 8,
    en: {
      slug: "how-much-does-it-cost-to-import-a-car-to-armenia",
      title: "How Much Does It Cost to Import a Car to Armenia?",
      seoDescription: "A transparent breakdown of every cost when importing a car to Armenia: auction fees, US transport, shipping, customs duty, VAT, registration.",
      excerpt: "Auction price is only the beginning. Here is every line item — and roughly how big each one is.",
      content: `The number you see on the auction page is typically **55–70%** of what the car will cost you in Armenia. The rest is made of eight predictable parts.

| Cost item | What it is |
|---|---|
| Car price | Your winning bid |
| Auction fees | Buyer, gate and online bidding fees — tiered by price |
| USA inland transport | Yard → export port |
| International shipping | Port → Poti, then truck to Armenia |
| Customs & VAT | Duty based on value/age/engine, then VAT |
| Broker & documentation | Declaration, translations, certificates |
| Registration | Plates, inspection, registration fees |
| Service fee | Our fixed or percentage fee |

## Example

For a **2022 Toyota Camry hybrid** bought for **$12,000**, the estimate lands around **$18–19k** in Armenia, depending on the destination and the current exchange rate.

## Why estimates differ from final numbers

Customs value is confirmed by the official assessment on arrival, and exchange rates move. That's why we always separate the **estimated** cost from the **final** cost in your dashboard.

Try your own numbers in the [AutoHunt calculator](/en/calculator).`,
    },
    ru: {
      slug: "skolko-stoit-prignat-avto-v-armeniyu",
      title: "Сколько стоит пригнать авто в Армению?",
      seoDescription: "Прозрачная разбивка всех расходов на пригон авто в Армению: сборы аукциона, доставка, фрахт, пошлина, НДС, регистрация.",
      excerpt: "Цена аукциона — только начало. Вот каждая статья расходов и её примерный размер.",
      content: `Цифра на странице аукциона — обычно **55–70%** от того, во сколько авто обойдётся вам в Армении. Остальное — восемь предсказуемых частей.

| Статья | Что это |
|---|---|
| Цена авто | Ваша выигравшая ставка |
| Сборы аукциона | Сборы покупателя, gate, онлайн-ставки |
| Доставка по США | Площадка → порт |
| Морская доставка | Порт → Поти, далее в Армению |
| Таможня и НДС | Пошлина по стоимости/возрасту/объёму + НДС |
| Брокер и документы | Декларация, переводы, сертификаты |
| Регистрация | Номера, техосмотр, сборы |
| Услуги | Наша фиксированная или процентная комиссия |

## Пример

**Toyota Camry hybrid 2022** за **$12 000** на аукционе — ориентировочно **$18–19 тыс.** в Армении.

## Почему оценка отличается от итога

Таможенная стоимость подтверждается официальной оценкой, а курсы меняются. Поэтому в кабинете мы всегда разделяем **предварительную** и **финальную** стоимость.

Посчитайте свой вариант в [калькуляторе AutoHunt](/ru/calculator).`,
    },
    hy: {
      slug: "vorqan-e-arjenum-meqenayi-nermucumy-hayastan",
      title: "Որքա՞ն արժե մեքենա ներմուծել Հայաստան",
      seoDescription: "Հայաստան մեքենա ներմուծելու բոլոր ծախսերի թափանցիկ բաշխում՝ աճուրդի վճարներ, առաքում, մաքսատուրք, ԱԱՀ, հաշվառում։",
      excerpt: "Աճուրդային գինը միայն սկիզբն է։ Ահա ծախսերի յուրաքանչյուր տողը և դրա մոտավոր չափը։",
      content: `Աճուրդի էջում տեսած թիվը սովորաբար կազմում է Հայաստանում մեքենայի վերջնական արժեքի **55–70%**-ը։ Մնացածը ութ կանխատեսելի մասեր են։

| Ծախս | Ինչ է |
|---|---|
| Մեքենայի գին | Ձեր հաղթող խաղադրույքը |
| Աճուրդի վճարներ | Գնորդի, gate և առցանց խաղադրույքի վճարներ |
| Տեղափոխում ԱՄՆ-ում | Հրապարակ → նավահանգիստ |
| Միջազգային առաքում | Նավահանգիստ → Փոթի → Հայաստան |
| Մաքս և ԱԱՀ | Մաքսատուրք ըստ արժեքի/տարիքի/ծավալի + ԱԱՀ |
| Բրոքեր և փաստաթղթեր | Հայտարարագիր, թարգմանություններ |
| Հաշվառում | Համարանիշեր, տեխզննում |
| Ծառայություն | Մեր ֆիքսված կամ տոկոսային վճարը |

## Օրինակ

**2022 Toyota Camry hybrid**՝ աճուրդում **$12 000** — Հայաստանում մոտ **$18–19 հազար**։

## Ինչու է նախնականը տարբերվում վերջնականից

Մաքսային արժեքը հաստատվում է պաշտոնական գնահատմամբ, իսկ փոխարժեքները փոխվում են։ Այդ պատճառով անձնական էջում միշտ առանձնացնում ենք **նախնական** և **վերջնական** արժեքները։

Փորձեք ձեր թվերը [AutoHunt հաշվիչում](/hy/calculator)։`,
    },
  },
  {
    category: "GUIDES",
    authorName: "Aram Hakobyan",
    coverImage: "/images/site/audi-r8.jpg",
    daysAgo: 15,
    en: {
      slug: "how-to-calculate-the-real-cost-of-an-auction-car",
      title: "How to Calculate the Real Cost of an Auction Car",
      seoDescription: "Learn how to calculate the full landed cost of a US auction car in Armenia — including repair budget and hidden fees.",
      excerpt: "A simple framework: landed cost + repair budget + risk buffer = the number that matters.",
      content: `A great auction deal can turn into an average one if you only look at the bid. Use this three-part framework.

## 1. Landed cost

Bid + auction fees + transport + shipping + customs + documents + registration + service. This is what the [calculator](/en/calculator) shows.

## 2. Repair budget

For damaged lots, get an estimate from photos **before** bidding. Add 15–20% for hidden damage on anything with airbag deployment or frame damage.

## 3. Risk buffer

Keep 3–5% for exchange-rate movement and assessment differences.

## The rule of thumb

If **landed cost + repair budget + buffer** is at least 20% below the local market price of the same car, it's a good deal.`,
    },
    ru: {
      slug: "kak-rasschitat-realnuyu-stoimost-avto-s-aukciona",
      title: "Как рассчитать реальную стоимость авто с аукциона",
      seoDescription: "Как посчитать полную стоимость авто с аукциона США в Армении — с учётом ремонта и скрытых расходов.",
      excerpt: "Простая формула: стоимость под ключ + бюджет ремонта + запас = цифра, которая важна.",
      content: `Отличная сделка на аукционе может стать средней, если смотреть только на ставку.

## 1. Стоимость под ключ

Ставка + сборы + доставка + фрахт + таможня + документы + регистрация + услуги. Это показывает [калькулятор](/ru/calculator).

## 2. Бюджет ремонта

Для повреждённых лотов оцените ремонт по фото **до** ставки. Добавьте 15–20% при срабатывании подушек или повреждении рамы.

## 3. Запас на риски

Держите 3–5% на колебания курса и разницу в оценке.

## Правило

Если **стоимость под ключ + ремонт + запас** хотя бы на 20% ниже рыночной цены такого же авто — сделка хорошая.`,
    },
    hy: {
      slug: "inchpes-hashvel-achurdayin-meqenayi-irakan-arjeqy",
      title: "Ինչպես հաշվել աճուրդային մեքենայի իրական արժեքը",
      seoDescription: "Ինչպես հաշվել ԱՄՆ աճուրդից մեքենայի ամբողջական արժեքը Հայաստանում՝ ներառյալ վերանորոգումը և թաքնված ծախսերը։",
      excerpt: "Պարզ բանաձև՝ ամբողջական արժեք + վերանորոգման բյուջե + պահուստ = կարևոր թիվը։",
      content: `Աճուրդային լավ գործարքը կարող է դառնալ միջակ, եթե նայեք միայն խաղադրույքին։

## 1. Ամբողջական արժեք

Խաղադրույք + վճարներ + տեղափոխում + առաքում + մաքս + փաստաթղթեր + հաշվառում + ծառայություն։ Սա ցույց է տալիս [հաշվիչը](/hy/calculator)։

## 2. Վերանորոգման բյուջե

Վնասված լոտերի համար գնահատեք վերանորոգումը լուսանկարներով **մինչև** խաղադրույքը։ Ավելացրեք 15–20%, եթե բացվել են բարձիկները կամ վնասված է շրջանակը։

## 3. Ռիսկերի պահուստ

Պահեք 3–5% փոխարժեքի տատանումների և գնահատման տարբերությունների համար։

## Կանոնը

Եթե **ամբողջական արժեք + վերանորոգում + պահուստ**-ը առնվազն 20%-ով ցածր է նույն մեքենայի շուկայական գնից, գործարքը լավն է։`,
    },
  },
  {
    category: "AUCTIONS",
    authorName: "Davit Sargsyan",
    coverImage: "/images/site/camaro-garage.jpg",
    daysAgo: 24,
    en: {
      slug: "copart-vs-iaa-what-is-the-difference",
      title: "Copart vs IAA: What Is the Difference?",
      seoDescription: "Copart vs IAA (IAAI) compared: inventory, fees, bidding format, vehicle condition and which is better for importing to Armenia.",
      excerpt: "Both sell insurance and fleet vehicles — but fees, bidding and inventory differ in ways that matter.",
      content: `Copart and IAA (Insurance Auto Auctions) together sell millions of vehicles a year. For an importer, the differences are practical.

## Inventory

- **Copart**: larger overall inventory, more variety of damage types and more clean-title fleet cars.
- **IAA**: strong in insurance total-loss vehicles, often with detailed condition reports.

## Bidding

Copart runs **virtual bidding** with a preliminary online round. IAA uses **Timed** and **Live-Online** formats. Both support proxy bids.

## Fees

Both use tiered buyer fees based on the sale price, plus gate and online-bidding fees. Differences are usually $50–200 per car — our calculator uses the current tier tables for each.

## Which is better?

Neither. The right answer is whichever has the **right car** at the right price this week — which is why we search both.`,
    },
    ru: {
      slug: "copart-ili-iaa-v-chem-raznica",
      title: "Copart или IAA: в чём разница?",
      seoDescription: "Сравнение Copart и IAA (IAAI): ассортимент, сборы, формат торгов, состояние авто и что лучше для пригона в Армению.",
      excerpt: "Оба продают страховые и флотские авто — но сборы, торги и ассортимент отличаются.",
      content: `Copart и IAA (Insurance Auto Auctions) вместе продают миллионы авто в год. Для импортёра различия практические.

## Ассортимент

- **Copart**: больше лотов, больше типов повреждений и больше флотских авто с чистым тайтлом.
- **IAA**: сильны в страховых тоталах, часто с подробными отчётами о состоянии.

## Торги

Copart — **виртуальные торги** с предварительным онлайн-раундом. IAA — форматы **Timed** и **Live-Online**.

## Сборы

Оба используют ступенчатые сборы покупателя по цене продажи. Разница — обычно $50–200 на авто; калькулятор учитывает актуальные таблицы.

## Что лучше?

Ни то, ни другое. Лучше тот, где на этой неделе есть **нужный авто** по нужной цене — поэтому мы ищем на обоих.`,
    },
    hy: {
      slug: "copart-te-iaa-vorn-e-tarberutyuny",
      title: "Copart թե IAA․ ո՞րն է տարբերությունը",
      seoDescription: "Copart և IAA (IAAI) համեմատություն՝ տեսականի, վճարներ, աճուրդի ձևաչափ և որն է ավելի լավ Հայաստան ներմուծելու համար։",
      excerpt: "Երկուսն էլ վաճառում են ապահովագրական և ավտոպարկային մեքենաներ, բայց վճարներն ու տեսականին տարբերվում են։",
      content: `Copart-ը և IAA-ն (Insurance Auto Auctions) միասին տարեկան միլիոնավոր մեքենաներ են վաճառում։ Ներմուծողի համար տարբերությունները գործնական են։

## Տեսականի

- **Copart**՝ ավելի շատ լոտեր, վնասների ավելի շատ տեսակներ և մաքուր title-ով ավտոպարկային մեքենաներ։
- **IAA**՝ ուժեղ է ապահովագրական մեքենաներում, հաճախ մանրամասն վիճակի հաշվետվություններով։

## Աճուրդ

Copart-ը՝ **վիրտուալ աճուրդ** նախնական առցանց փուլով։ IAA-ն՝ **Timed** և **Live-Online** ձևաչափեր։

## Վճարներ

Երկուսն էլ կիրառում են գնից կախված աստիճանային վճարներ։ Տարբերությունը սովորաբար $50–200 է. մեր հաշվիչը օգտագործում է գործող աղյուսակները։

## Ո՞րն է ավելի լավ

Ոչ մեկը։ Լավագույնն այն է, որտեղ այս շաբաթ կա **ճիշտ մեքենան** ճիշտ գնով, այդ պատճառով մենք որոնում ենք երկուսում էլ։`,
    },
  },
  {
    category: "MAINTENANCE",
    authorName: "Lilit Grigoryan",
    coverImage: "/images/site/tesla-road.jpg",
    daysAgo: 35,
    en: {
      slug: "hybrid-or-electric-in-armenia",
      title: "Hybrid or Electric: What Makes Sense in Armenia?",
      seoDescription: "Hybrid vs electric cars in Armenia: charging, winter range, mountain roads, maintenance and total cost of ownership.",
      excerpt: "Charging access, winter range and mountain roads — how to choose between a hybrid and an EV.",
      content: `Both are popular imports. The right choice depends on how and where you drive.

## Choose an EV if…

- You can charge at home or at work
- Most trips are within Yerevan/Gyumri or between them
- You want the lowest running cost

## Choose a hybrid if…

- You travel to regions without fast chargers
- You park on the street
- You want simple ownership with no range planning

## Winter tip

Look for EVs with a **heat pump** — it can preserve 15–25% more range in cold weather.`,
    },
    ru: {
      slug: "gibrid-ili-elektromobil-v-armenii",
      title: "Гибрид или электромобиль: что выбрать в Армении?",
      seoDescription: "Гибрид или электромобиль в Армении: зарядка, запас хода зимой, горные дороги, обслуживание и стоимость владения.",
      excerpt: "Зарядка, зимний запас хода и горы — как выбрать между гибридом и электромобилем.",
      content: `Оба варианта популярны. Выбор зависит от того, как и где вы ездите.

## Электромобиль, если…

- Можете заряжаться дома или на работе
- Большинство поездок — по Еревану/Гюмри или между ними
- Хотите минимальные расходы

## Гибрид, если…

- Ездите в регионы без быстрых зарядок
- Паркуетесь на улице
- Хотите простого владения без планирования запаса хода

## Совет на зиму

Ищите электромобили с **тепловым насосом** — это сохраняет 15–25% запаса хода в мороз.`,
    },
    hy: {
      slug: "hibrid-te-elektrakan-hayastanum",
      title: "Հիբրիդ թե էլեկտրական․ ի՞նչ ընտրել Հայաստանում",
      seoDescription: "Հիբրիդ թե էլեկտրական մեքենա Հայաստանում՝ լիցքավորում, ձմեռային վազք, լեռնային ճանապարհներ և սպասարկում։",
      excerpt: "Լիցքավորում, ձմեռային վազք և լեռներ՝ ինչպես ընտրել հիբրիդի և էլեկտրականի միջև։",
      content: `Երկուսն էլ սիրված են։ Ընտրությունը կախված է նրանից, թե ինչպես և որտեղ եք վարում։

## Էլեկտրական, եթե…

- Կարող եք լիցքավորել տանը կամ աշխատավայրում
- Ուղևորությունների մեծ մասը Երևանում/Գյումրիում է կամ նրանց միջև
- Ցանկանում եք նվազագույն ծախսեր

## Հիբրիդ, եթե…

- Մեկնում եք մարզեր, որտեղ արագ լիցքավորում չկա
- Կայանում եք փողոցում
- Ցանկանում եք պարզ շահագործում

## Ձմեռային խորհուրդ

Փնտրեք **ջերմային պոմպով** էլեկտրական մեքենաներ. այն ցրտին պահպանում է 15–25%-ով ավելի վազք։`,
    },
  },
];
