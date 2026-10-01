-- Data migration: six demo rental cars so the /rent page is not empty on a new deploy.
-- Runs once per database. Cars whose slug already exists are left untouched; edit or delete
-- them in /admin/cars afterwards — they won't be re-added.
CREATE TEMP TABLE r (slug text, brand text, model text, trim text, year int, km int, engine float, fuel "FuelType", trans "Transmission", drive "Drive", body "BodyType", color text, price int, deposit int, mindays int, loc text, featured bool, feats text[], imgs text[], hy text, ru text, en text);
INSERT INTO r VALUES
('rent-hyundai-accent-2020','Hyundai','Accent',NULL,2020,58000,1.6,'GASOLINE','AUTOMATIC','FWD','SEDAN','White',30,200,1,'Gyumri',false,
 ARRAY['Air conditioning','Bluetooth','USB charging'], ARRAY['/images/cars/hyundai-accent.jpg'],
 'Խնայողական և հուսալի սեդան քաղաքի համար։ Ցածր վառելիքի ծախս, հարմար կայանելու համար։',
 'Экономичный и надёжный седан для города. Низкий расход топлива, легко парковаться.',
 'Economical, reliable city sedan. Low fuel consumption and easy to park.'),
('rent-vw-golf-2019','Volkswagen','Golf','TSI',2019,64000,1.4,'GASOLINE','AUTOMATIC','FWD','HATCHBACK','Gray',35,250,1,'Gyumri',false,
 ARRAY['Air conditioning','Apple CarPlay','Cruise control'], ARRAY['/images/cars/vw-golf.jpg'],
 'Կոմպակտ և աշխույժ հեչբեք՝ քաղաքի և կարճ ճամփորդությունների համար։',
 'Компактный и живой хэтчбек для города и коротких поездок.',
 'Compact, lively hatchback for the city and short trips.'),
('rent-nissan-juke-2019','Nissan','Juke','SV',2019,71000,1.6,'GASOLINE','CVT','FWD','CROSSOVER','Red',38,250,2,'Gyumri',false,
 ARRAY['Air conditioning','Rear camera','Bluetooth'], ARRAY['/images/cars/nissan-juke.jpg'],
 'Ոճային կրոսովեր՝ բարձր նստատեղով և լավ տեսանելիությամբ։',
 'Стильный кроссовер с высокой посадкой и хорошим обзором.',
 'Stylish crossover with a high seating position and great visibility.'),
('rent-toyota-camry-2021','Toyota','Camry','LE',2021,52000,2.5,'GASOLINE','AUTOMATIC','FWD','SEDAN','Silver',45,300,2,'Yerevan',true,
 ARRAY['Air conditioning','Apple CarPlay','Adaptive cruise control','Rear camera'], ARRAY['/images/cars/toyota-camry.jpg'],
 'Հարմարավետ բիզնես դասի սեդան՝ երկար ճանապարհների և հանդիպումների համար։',
 'Комфортный седан бизнес-класса для дальних поездок и деловых встреч.',
 'Comfortable business-class sedan for long drives and meetings.'),
('rent-tesla-model-3-2021','Tesla','Model 3','Long Range',2021,45000,NULL,'ELECTRIC','AUTOMATIC','AWD','SEDAN','White',70,500,2,'Yerevan',true,
 ARRAY['Autopilot','Panoramic roof','Heated seats','Premium audio'], ARRAY['/images/cars/tesla-model-3.jpg','/images/cars/tesla-model-3-2.jpg'],
 'Էլեկտրական սեդան՝ մինչև 500 կմ պաշարով։ Լիցքավորման մալուխը ներառված է։',
 'Электрический седан с запасом хода до 500 км. Кабель для зарядки в комплекте.',
 'Electric sedan with up to 500 km of range. Charging cable included.'),
('rent-ford-expedition-2020','Ford','Expedition','XLT',2020,80000,3.5,'GASOLINE','AUTOMATIC','FOUR_WD','SUV','Black',95,700,3,'Yerevan',false,
 ARRAY['8 seats','4x4','Air conditioning','Rear camera','Large trunk'], ARRAY['/images/cars/ford-expedition.jpg'],
 'Մեծ 8-տեղանոց ամենագնաց՝ ընտանիքի, խմբերի և լեռնային ճանապարհների համար։',
 'Большой 8-местный внедорожник для семьи, компаний и горных дорог.',
 'Large 8-seat SUV for families, groups and mountain roads.');

INSERT INTO "Car" (id, slug, "listingType", brand, model, trim, year, mileage, "mileageUnit", "engineVolume", fuel, transmission, drive, "bodyType", color, price, "rentDeposit", "rentMinDays", location, source, status, published, featured, features, "createdAt", "updatedAt")
SELECT 'rent' || substr(md5(slug), 1, 21), slug, 'RENT', brand, model, trim, year, km, 'KM', engine, fuel, trans, drive, body, color, price, deposit, mindays, loc, 'Local', 'AVAILABLE', true, featured, feats, now(), now() FROM r
ON CONFLICT DO NOTHING;

INSERT INTO "CarImage" (id, "carId", url, alt, "sortOrder")
SELECT 'rimg' || substr(md5(r.slug || u.url), 1, 21), 'rent' || substr(md5(r.slug), 1, 21), u.url, r.year || ' ' || r.brand || ' ' || r.model, u.ord - 1
FROM r JOIN "Car" c ON c.id = 'rent' || substr(md5(r.slug), 1, 21), unnest(r.imgs) WITH ORDINALITY AS u(url, ord)
ON CONFLICT DO NOTHING;

INSERT INTO "CarTranslation" (id, "carId", locale, description)
SELECT 'rtr' || substr(md5(r.slug || l.loc), 1, 22), 'rent' || substr(md5(r.slug), 1, 21), l.loc::"Locale", CASE l.loc WHEN 'hy' THEN r.hy WHEN 'ru' THEN r.ru ELSE r.en END
FROM r JOIN "Car" c ON c.id = 'rent' || substr(md5(r.slug), 1, 21), (VALUES ('hy'), ('ru'), ('en')) AS l(loc)
ON CONFLICT DO NOTHING;
DROP TABLE r;
