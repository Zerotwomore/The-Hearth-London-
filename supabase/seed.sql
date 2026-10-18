-- Local development data, generated from the prototype fixtures in
-- src/lib/data. Runs on `supabase db reset`; never run against production.
--
-- Every account's password is: hearth-dev-password
-- The prototype's signed-in user (JJ) is jj@hearth.local.
--
-- Dates are shifted so the prototype's "today" (2026-09-08) becomes the
-- day you reset, keeping events upcoming and chats open.

create function pg_temp.shifted(local_time text)
returns timestamptz
language sql
stable
as $$
  select (local_time::timestamp at time zone 'Europe/London')
    -- Whole London days, so wall-clock times are kept exactly.
    + (date_trunc('day', now() at time zone 'Europe/London') - timestamp '2026-09-08')
$$;

-- Accounts (the on_auth_user_created trigger creates their profiles)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000001', 'authenticated', 'authenticated', 'jj@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"JJ"}'::jsonb, '2026-06-02', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000002', 'authenticated', 'authenticated', 'priya.nair@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Priya Nair"}'::jsonb, '2025-11-14', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000003', 'authenticated', 'authenticated', 'tom.whitfield@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Tom Whitfield"}'::jsonb, '2025-09-21', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000004', 'authenticated', 'authenticated', 'yuki.tanaka@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Yuki Tanaka"}'::jsonb, '2026-01-08', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000005', 'authenticated', 'authenticated', 'zz@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"ZZ"}'::jsonb, '2025-08-30', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000006', 'authenticated', 'authenticated', 'daniel.osei@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Daniel Osei"}'::jsonb, '2026-03-17', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000007', 'authenticated', 'authenticated', 'emma.clarke@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Emma Clarke"}'::jsonb, '2025-12-05', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000008', 'authenticated', 'authenticated', 'marcus.lee@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Marcus Lee"}'::jsonb, '2026-02-19', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000009', 'authenticated', 'authenticated', 'hana.kim@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Hana Kim"}'::jsonb, '2026-05-11', now(),
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4001-a000-000000000010', 'authenticated', 'authenticated', 'wen.zhao@hearth.local',
   extensions.crypt('hearth-dev-password', extensions.gen_salt('bf')), now(),
   '{"provider": "email", "providers": ["email"]}', '{"name":"Wen Zhao"}'::jsonb, '2025-07-04', now(),
   '', '', '', '');

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) values
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000001', '00000000-0000-4001-a000-000000000001', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000001","email":"jj@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000002', '00000000-0000-4001-a000-000000000002', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000002","email":"priya.nair@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000003', '00000000-0000-4001-a000-000000000003', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000003","email":"tom.whitfield@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000004', '00000000-0000-4001-a000-000000000004', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000004","email":"yuki.tanaka@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000005', '00000000-0000-4001-a000-000000000005', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000005","email":"zz@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000006', '00000000-0000-4001-a000-000000000006', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000006","email":"daniel.osei@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000007', '00000000-0000-4001-a000-000000000007', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000007","email":"emma.clarke@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000008', '00000000-0000-4001-a000-000000000008', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000008","email":"marcus.lee@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000009', '00000000-0000-4001-a000-000000000009', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000009","email":"hana.kim@hearth.local","email_verified":true}'::jsonb, now(), now(), now()),
  (gen_random_uuid(), '00000000-0000-4001-a000-000000000010', '00000000-0000-4001-a000-000000000010', 'email',
   '{"sub":"00000000-0000-4001-a000-000000000010","email":"wen.zhao@hearth.local","email_verified":true}'::jsonb, now(), now(), now());

-- Profiles
update public.profiles p set
  name = v.name,
  name_zh = v.name_zh,
  bio = v.bio,
  verified = v.verified,
  onboarded_at = v.created_at,
  created_at = v.created_at
from (values
  ('00000000-0000-4001-a000-000000000001'::uuid, 'JJ', 'JJ', 'Young technology professional from Canada, working in London on a YMS visa, loves to walk around Canary Wharf, architecture, art galleries, and finding the best Pret a Manger sandwich.', true, '2026-06-02'::timestamptz),
  ('00000000-0000-4001-a000-000000000002'::uuid, 'Priya Nair', null, 'Board games and bad wine. Moved from Toronto last year.', false, '2025-11-14'::timestamptz),
  ('00000000-0000-4001-a000-000000000003'::uuid, 'Tom Whitfield', null, 'Walking club regular, always looking for new trails.', false, '2025-09-21'::timestamptz),
  ('00000000-0000-4001-a000-000000000004'::uuid, 'Yuki Tanaka', null, 'Here for the gigs and the museums.', false, '2026-01-08'::timestamptz),
  ('00000000-0000-4001-a000-000000000005'::uuid, 'ZZ', 'ZZ', 'Runs the Friday reading group. Fluent in bad puns.', true, '2025-08-30'::timestamptz),
  ('00000000-0000-4001-a000-000000000006'::uuid, 'Daniel Osei', null, 'Cycling every weekend, rain or shine.', false, '2026-03-17'::timestamptz),
  ('00000000-0000-4001-a000-000000000007'::uuid, 'Emma Clarke', null, 'Pub quiz captain. Undefeated since March.', false, '2025-12-05'::timestamptz),
  ('00000000-0000-4001-a000-000000000008'::uuid, 'Marcus Lee', '李明', 'Photographer chasing golden hour across the city.', false, '2026-02-19'::timestamptz),
  ('00000000-0000-4001-a000-000000000009'::uuid, 'Hana Kim', null, 'Recently arrived from Seoul, love a good supper club.', true, '2026-05-11'::timestamptz),
  ('00000000-0000-4001-a000-000000000010'::uuid, 'Wen Zhao', '赵文', 'History teacher. I run the gallery tours — 700 years in two hours.', true, '2025-07-04'::timestamptz)
) as v (id, name, name_zh, bio, verified, created_at)
where p.id = v.id;

insert into public.profile_interests (user_id, interest_id) values
  ('00000000-0000-4001-a000-000000000001', 'art-culture'),
  ('00000000-0000-4001-a000-000000000001', 'hiking'),
  ('00000000-0000-4001-a000-000000000001', 'photography'),
  ('00000000-0000-4001-a000-000000000002', 'board-games'),
  ('00000000-0000-4001-a000-000000000002', 'wine-tasting'),
  ('00000000-0000-4001-a000-000000000003', 'hiking'),
  ('00000000-0000-4001-a000-000000000003', 'running'),
  ('00000000-0000-4001-a000-000000000004', 'live-music'),
  ('00000000-0000-4001-a000-000000000004', 'art-culture'),
  ('00000000-0000-4001-a000-000000000005', 'language-exchange'),
  ('00000000-0000-4001-a000-000000000005', 'reading'),
  ('00000000-0000-4001-a000-000000000006', 'cycling'),
  ('00000000-0000-4001-a000-000000000006', 'running'),
  ('00000000-0000-4001-a000-000000000007', 'pub-quiz'),
  ('00000000-0000-4001-a000-000000000007', 'food-drink'),
  ('00000000-0000-4001-a000-000000000008', 'photography'),
  ('00000000-0000-4001-a000-000000000008', 'art-culture'),
  ('00000000-0000-4001-a000-000000000009', 'food-drink'),
  ('00000000-0000-4001-a000-000000000009', 'wine-tasting'),
  ('00000000-0000-4001-a000-000000000010', 'art-culture'),
  ('00000000-0000-4001-a000-000000000010', 'reading');

-- Events (the on_event_created trigger creates each group chat).
-- VIP is not part of the MVP: members-only fixtures become regular events.
insert into public.events (
  id, title, category_id, poster_url, gallery_urls, starts_at, ends_at,
  location_name, location_area, host_id, capacity, description, highlights,
  price_pence, price_label
) values
  ('00000000-0000-4002-a000-000000000001', '{"en":"National Gallery: Expert-Led Highlights Tour","zh":"伦敦国家美术馆 · 权威专家导览"}'::jsonb, 'art-culture', 'https://picsum.photos/seed/hearth-gallery-poster/900/1200',
   array['https://picsum.photos/seed/hearth-gallery-1/800/1000', 'https://picsum.photos/seed/hearth-gallery-2/800/1000', 'https://picsum.photos/seed/hearth-gallery-3/800/1000'],
   pg_temp.shifted('2026-09-10T15:00:00'), pg_temp.shifted('2026-09-10T17:00:00'),
   '{"en":"The National Gallery","zh":"伦敦国家美术馆"}'::jsonb, '{"en":"Trafalgar Square","zh":"特拉法加广场"}'::jsonb, '00000000-0000-4001-a000-000000000010', 15,
   '{"en":"Too crowded at the weekend? Want the stories behind the paintings? A two-hour walk through 700 years of European painting with a history teacher who knows where to linger.","zh":"周末人太多？想深入了解名画背后的故事？由历史人文老师带队，两小时穿越七百年欧洲绘画史。"}'::jsonb, '[{"en":"Meet the masters — Monet''s Water Lilies and Turner''s Fighting Temeraire, up close.","zh":"邂逅大师真迹 —— 近距离欣赏莫奈《睡莲》与透纳《被拖去解体的战舰无畏号》。"},{"en":"Behind the canvas — the history and gossip behind each painting.","zh":"揭秘画布背后 —— 聆听艺术家与名画背后的历史趣闻。"},{"en":"Personal VOX headset so you catch every word.","zh":"配备个人 VOX 耳机，不错过任何一句讲解。"},{"en":"Thursday 3pm — deliberately off-peak, no weekend crush.","zh":"周四下午三点 —— 避开人潮，享受完美的艺术午后。"}]'::jsonb,
   2000, null),
  ('00000000-0000-4002-a000-000000000002', '{"en":"Reading Group: NERVOUS — Anxiety & Discipline","zh":"读书会 NERVOUS · 焦虑与规律"}'::jsonb, 'reading', 'https://picsum.photos/seed/hearth-reading-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-11T16:30:00'), pg_temp.shifted('2026-09-11T18:00:00'),
   '{"en":"Hearth Studio","zh":"The Hearth 工作室"}'::jsonb, '{"en":"Bloomsbury","zh":"布鲁姆斯伯里"}'::jsonb, '00000000-0000-4001-a000-000000000005', 12,
   '{"en":"Eastern and Western thinking on anxiety, routine and why we struggle to sit still. Come having read anything or nothing — the conversation matters more than the homework.","zh":"从东西方智慧聊焦虑、规律，以及我们为何难以静下来。读没读完都欢迎 —— 聊天比作业重要。"}'::jsonb, '[{"en":"Small group, everyone speaks — no lecture, no expert at the front.","zh":"小组讨论，人人发言 —— 没有讲座，没有权威。"},{"en":"Bilingual discussion, switch between 中文 and English freely.","zh":"中英双语讨论，随时切换。"},{"en":"Friday 16:30, tea and something sweet included.","zh":"周五 16:30，含茶点。"}]'::jsonb,
   990, null),
  ('00000000-0000-4002-a000-000000000003', '{"en":"Newcomers Supper Club: Autumn Roast","zh":"新客晚餐会 · 秋日烤肉"}'::jsonb, 'dinner', 'https://picsum.photos/seed/hearth-supper-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-12T19:00:00'), null,
   '{"en":"The Ten Bells","zh":"十钟酒馆"}'::jsonb, '{"en":"Shoreditch","zh":"肖尔迪奇"}'::jsonb, '00000000-0000-4001-a000-000000000009', 10,
   '{"en":"A relaxed, home-style roast for anyone new to London. Come solo — that''s the point. Dietary needs accommodated, just tell the host.","zh":"为初到伦敦的人准备的家常烤肉晚餐。一个人来最好 —— 这就是重点。有饮食需求请提前告知主办人。"}'::jsonb, '[{"en":"Long table, everyone introduced, no awkward hovering.","zh":"长桌就座，逐一介绍，不必尴尬站着。"},{"en":"Three courses, wine optional.","zh":"三道菜，酒水自选。"},{"en":"Half the table arrived in London this year.","zh":"一半的人都是今年才来伦敦。"}]'::jsonb,
   1800, null),
  ('00000000-0000-4002-a000-000000000004', '{"en":"Richmond Park Sunrise Walk","zh":"里士满公园 · 日出漫步"}'::jsonb, 'outdoors', 'https://picsum.photos/seed/hearth-richmond-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-13T07:30:00'), null,
   '{"en":"Pembroke Lodge","zh":"彭布罗克小屋"}'::jsonb, '{"en":"Richmond","zh":"里士满"}'::jsonb, '00000000-0000-4001-a000-000000000003', 14,
   '{"en":"An easy 8km loop to catch the deer waking and mist over the ponds. Bring a flask — we stop for coffee halfway.","zh":"轻松的八公里环线，看鹿群苏醒、薄雾笼罩池塘。带上保温杯 —— 中途会停下喝咖啡。"}'::jsonb, '[{"en":"Flat, easy pace, no one gets left behind.","zh":"路线平缓，节奏轻松，不会掉队。"},{"en":"Deer at close range if we''re early enough.","zh":"来得够早就能近距离看到鹿。"},{"en":"Free — just bring yourself.","zh":"免费 —— 人来就好。"}]'::jsonb,
   0, '{"en":"Free","zh":"免费"}'::jsonb),
  ('00000000-0000-4002-a000-000000000005', '{"en":"Board Game Fireside: Settlers Night","zh":"The Hearth 桌游夜 · 卡坦岛专场"}'::jsonb, 'board-games', 'https://picsum.photos/seed/hearth-boardgame-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-15T18:30:00'), null,
   '{"en":"Draughts Board Game Café","zh":"Draughts 桌游咖啡"}'::jsonb, '{"en":"Hackney","zh":"哈克尼"}'::jsonb, '00000000-0000-4001-a000-000000000002', 12,
   '{"en":"Catan, Ticket to Ride, and whatever else is on the shelf. Beginners very welcome — we''ll teach you as we go.","zh":"卡坦岛、铁路之旅，架子上有什么玩什么。欢迎新手 —— 边玩边教。"}'::jsonb, '[{"en":"Rules taught from scratch, no experience needed.","zh":"从零开始教规则，无需经验。"},{"en":"Table booked for six hours, come and go.","zh":"包桌六小时，随时来去。"}]'::jsonb,
   600, '{"en":"£6 table fee","zh":"£6 桌费"}'::jsonb),
  ('00000000-0000-4002-a000-000000000006', '{"en":"Clapham Common Pub Wind-Down","zh":"克拉彭公园 · 周末小酌"}'::jsonb, 'bar', 'https://picsum.photos/seed/hearth-pub-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-18T18:00:00'), null,
   '{"en":"The Sun","zh":"太阳酒馆"}'::jsonb, '{"en":"Clapham","zh":"克拉彭"}'::jsonb, '00000000-0000-4001-a000-000000000007', 16,
   '{"en":"End-of-week pints in the garden if it''s dry, inside by the fire if it isn''t. Drop in, stay as long as you like.","zh":"周末收工小酌，天气好就在花园，下雨就坐在壁炉边。随时加入，想待多久待多久。"}'::jsonb, '[{"en":"No booking, no pressure, come after work.","zh":"无需预约，下班后直接来。"},{"en":"Look for the group by the fireplace.","zh":"在壁炉旁找我们。"}]'::jsonb,
   0, '{"en":"Pay your own way","zh":"各付各的"}'::jsonb),
  ('00000000-0000-4002-a000-000000000007', '{"en":"Camden Live: New Voices Night","zh":"卡姆登现场 · 新声之夜"}'::jsonb, 'live-event', 'https://picsum.photos/seed/hearth-live-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-19T20:00:00'), null,
   '{"en":"The Green Note","zh":"Green Note 音乐酒吧"}'::jsonb, '{"en":"Camden","zh":"卡姆登"}'::jsonb, '00000000-0000-4001-a000-000000000004', 20,
   '{"en":"A rotating lineup of new singer-songwriters in a tiny, cosy venue. We take the group table by the window if we arrive early.","zh":"小而温馨的场地，轮番上阵的新晋创作歌手。来得早就能占到窗边的大桌。"}'::jsonb, '[{"en":"Three acts, 40 minutes each.","zh":"三组演出，每组四十分钟。"},{"en":"Standing room, arrive by 7:45pm.","zh":"站席，建议 19:45 前到场。"}]'::jsonb,
   1200, null),
  ('00000000-0000-4002-a000-000000000008', '{"en":"After Hours: The Wallace Collection, Privately","zh":"闭馆之后 · 华莱士典藏私享导览"}'::jsonb, 'art-culture', 'https://picsum.photos/seed/hearth-afterhours-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-24T18:45:00'), pg_temp.shifted('2026-09-24T20:30:00'),
   '{"en":"The Wallace Collection","zh":"华莱士典藏馆"}'::jsonb, '{"en":"Marylebone","zh":"马里波恩"}'::jsonb, '00000000-0000-4001-a000-000000000010', 12,
   '{"en":"The galleries to ourselves after the doors close — twelve people, no crowds, a glass of something in the armoury. Members only.","zh":"闭馆之后的私享时光 —— 仅十二人，没有人潮，在军械厅小酌一杯。仅限会员。"}'::jsonb, '[{"en":"After-hours access, twelve places only","zh":"闭馆后专场，仅十二个名额"},{"en":"Curator-led route through the Great Gallery","zh":"策展人带队参观大画廊"},{"en":"A drink in the armoury afterwards","zh":"结束后于军械厅小酌"}]'::jsonb,
   3800, null),
  ('00000000-0000-4002-a000-000000000009', '{"en":"Members'' Table: Dinner at The Ivy Tower Bridge","zh":"会员长桌 · The Ivy 塔桥店晚宴"}'::jsonb, 'dinner', 'https://picsum.photos/seed/hearth-ivy-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-09-27T19:00:00'), pg_temp.shifted('2026-09-27T22:00:00'),
   '{"en":"The Ivy Tower Bridge","zh":"The Ivy 塔桥店"}'::jsonb, '{"en":"Tower Bridge","zh":"塔桥"}'::jsonb, '00000000-0000-4001-a000-000000000009', 10,
   '{"en":"One long table by the river, ten members, and the bridge lit up through the windows. Champagne on arrival, three courses, and nobody hurrying you out.","zh":"临河的一张长桌，十位会员，窗外是灯火通明的塔桥。入座香槟、三道式晚餐，没有人催你离席。"}'::jsonb, '[{"en":"Champagne reception with river and bridge views","zh":"香槟迎宾，坐拥河景与塔桥夜色"},{"en":"Three courses from the seasonal menu, wine pairing included","zh":"时令三道式晚餐，含配酒"},{"en":"Private long table — ten members, bring one guest","zh":"专属长桌 —— 十位会员，可携伴一位"}]'::jsonb,
   8500, null),
  ('00000000-0000-4002-a000-000000000010', '{"en":"Members'' Champagne Afternoon at Sketch","zh":"会员香槟午后 · Sketch"}'::jsonb, 'dinner', 'https://picsum.photos/seed/hearth-sketch-poster/900/1200',
   '{}',
   pg_temp.shifted('2026-10-03T15:00:00'), pg_temp.shifted('2026-10-03T17:00:00'),
   '{"en":"Sketch, The Gallery","zh":"Sketch 画廊厅"}'::jsonb, '{"en":"Mayfair","zh":"梅费尔"}'::jsonb, '00000000-0000-4001-a000-000000000010', 8,
   '{"en":"Afternoon tea in the pink room everyone photographs, with an art historian on hand to explain the David Shrigley drawings on the walls.","zh":"在人人拍照的粉色厅享用下午茶，并由艺术史学者为你讲解墙上 David Shrigley 的画作。"}'::jsonb, '[{"en":"Champagne afternoon tea for eight","zh":"八人香槟下午茶"},{"en":"A short talk on the room''s artwork","zh":"关于厅内艺术作品的小型导览"},{"en":"Members only, eight places","zh":"仅限会员，八个名额"}]'::jsonb,
   9500, null);

insert into public.event_attendees (event_id, user_id) values
  ('00000000-0000-4002-a000-000000000001', '00000000-0000-4001-a000-000000000004'),
  ('00000000-0000-4002-a000-000000000001', '00000000-0000-4001-a000-000000000008'),
  ('00000000-0000-4002-a000-000000000001', '00000000-0000-4001-a000-000000000005'),
  ('00000000-0000-4002-a000-000000000001', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4002-a000-000000000002', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4002-a000-000000000002', '00000000-0000-4001-a000-000000000010'),
  ('00000000-0000-4002-a000-000000000002', '00000000-0000-4001-a000-000000000002'),
  ('00000000-0000-4002-a000-000000000003', '00000000-0000-4001-a000-000000000002'),
  ('00000000-0000-4002-a000-000000000003', '00000000-0000-4001-a000-000000000005'),
  ('00000000-0000-4002-a000-000000000003', '00000000-0000-4001-a000-000000000007'),
  ('00000000-0000-4002-a000-000000000004', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4002-a000-000000000004', '00000000-0000-4001-a000-000000000006'),
  ('00000000-0000-4002-a000-000000000004', '00000000-0000-4001-a000-000000000008'),
  ('00000000-0000-4002-a000-000000000005', '00000000-0000-4001-a000-000000000005'),
  ('00000000-0000-4002-a000-000000000005', '00000000-0000-4001-a000-000000000007'),
  ('00000000-0000-4002-a000-000000000005', '00000000-0000-4001-a000-000000000009'),
  ('00000000-0000-4002-a000-000000000005', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4002-a000-000000000006', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4002-a000-000000000006', '00000000-0000-4001-a000-000000000006'),
  ('00000000-0000-4002-a000-000000000006', '00000000-0000-4001-a000-000000000009'),
  ('00000000-0000-4002-a000-000000000007', '00000000-0000-4001-a000-000000000008'),
  ('00000000-0000-4002-a000-000000000007', '00000000-0000-4001-a000-000000000003'),
  ('00000000-0000-4002-a000-000000000008', '00000000-0000-4001-a000-000000000004'),
  ('00000000-0000-4002-a000-000000000008', '00000000-0000-4001-a000-000000000008'),
  ('00000000-0000-4002-a000-000000000009', '00000000-0000-4001-a000-000000000002'),
  ('00000000-0000-4002-a000-000000000009', '00000000-0000-4001-a000-000000000005'),
  ('00000000-0000-4002-a000-000000000010', '00000000-0000-4001-a000-000000000004'),
  ('00000000-0000-4002-a000-000000000010', '00000000-0000-4001-a000-000000000008'),
  ('00000000-0000-4002-a000-000000000010', '00000000-0000-4001-a000-000000000002');

-- Clubs
insert into public.clubs (id, name, category, image_url, description) values
  ('00000000-0000-4003-a000-000000000001', '{"en":"Gallery Wanderers","zh":"看展小队"}'::jsonb, '{"en":"Art & Culture","zh":"艺术文化"}'::jsonb, 'https://picsum.photos/seed/hearth-club-gallery/900/1200', '{"en":"Expert-led tours and slow afternoons in London''s museums. Roughly one gallery a fortnight, always off-peak.","zh":"由专家带队的美术馆导览与悠闲午后。大约两周一馆，永远避开人潮。"}'::jsonb),
  ('00000000-0000-4003-a000-000000000002', '{"en":"The Reading Room","zh":"读书会"}'::jsonb, '{"en":"Books & Ideas","zh":"书与思想"}'::jsonb, 'https://picsum.photos/seed/hearth-club-reading/900/1200', '{"en":"Bilingual reading group meeting Fridays. East and West on one table — philosophy, fiction, and whatever''s bothering us.","zh":"每周五的中英双语读书会。东西方同桌 —— 哲学、小说，以及最近困扰我们的一切。"}'::jsonb),
  ('00000000-0000-4003-a000-000000000003', '{"en":"Newcomers Supper Club","zh":"新客晚餐会"}'::jsonb, '{"en":"Food & Drink","zh":"美食与酒"}'::jsonb, 'https://picsum.photos/seed/hearth-club-supper/900/1200', '{"en":"Monthly dinners for people who''ve just landed in London and want a table full of familiar strangers.","zh":"为刚落地伦敦的人准备的每月晚餐 —— 一桌熟悉的陌生人。"}'::jsonb),
  ('00000000-0000-4003-a000-000000000004', '{"en":"London Trail Walkers","zh":"伦敦徒步小组"}'::jsonb, '{"en":"Outdoors","zh":"户外"}'::jsonb, 'https://picsum.photos/seed/hearth-club-walkers/900/1200', '{"en":"Weekend walks around London''s parks and green spaces. All paces welcome, coffee always at the end.","zh":"周末在伦敦公园与绿地漫步。各种速度都欢迎，结束后一定喝咖啡。"}'::jsonb);

insert into public.club_members (club_id, user_id) values
  ('00000000-0000-4003-a000-000000000001', '00000000-0000-4001-a000-000000000010'),
  ('00000000-0000-4003-a000-000000000001', '00000000-0000-4001-a000-000000000004'),
  ('00000000-0000-4003-a000-000000000001', '00000000-0000-4001-a000-000000000008'),
  ('00000000-0000-4003-a000-000000000001', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4003-a000-000000000001', '00000000-0000-4001-a000-000000000005'),
  ('00000000-0000-4003-a000-000000000002', '00000000-0000-4001-a000-000000000005'),
  ('00000000-0000-4003-a000-000000000002', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4003-a000-000000000002', '00000000-0000-4001-a000-000000000010'),
  ('00000000-0000-4003-a000-000000000002', '00000000-0000-4001-a000-000000000002'),
  ('00000000-0000-4003-a000-000000000003', '00000000-0000-4001-a000-000000000009'),
  ('00000000-0000-4003-a000-000000000003', '00000000-0000-4001-a000-000000000002'),
  ('00000000-0000-4003-a000-000000000003', '00000000-0000-4001-a000-000000000005'),
  ('00000000-0000-4003-a000-000000000003', '00000000-0000-4001-a000-000000000007'),
  ('00000000-0000-4003-a000-000000000003', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4003-a000-000000000004', '00000000-0000-4001-a000-000000000003'),
  ('00000000-0000-4003-a000-000000000004', '00000000-0000-4001-a000-000000000001'),
  ('00000000-0000-4003-a000-000000000004', '00000000-0000-4001-a000-000000000006'),
  ('00000000-0000-4003-a000-000000000004', '00000000-0000-4001-a000-000000000008');

-- Members write posts in one language; the fixtures' English is used.
insert into public.club_posts (club_id, author_id, body, created_at) values
  ('00000000-0000-4003-a000-000000000001', '00000000-0000-4001-a000-000000000010', 'Next month: the Courtauld, focusing on the Impressionist room. 12 spots.', pg_temp.shifted('2026-09-02T10:15:00')),
  ('00000000-0000-4003-a000-000000000001', '00000000-0000-4001-a000-000000000008', 'Photos from the National Gallery walk are up — the Turner room was worth the early start.', pg_temp.shifted('2026-08-28T21:40:00')),
  ('00000000-0000-4003-a000-000000000002', '00000000-0000-4001-a000-000000000005', 'This Friday: NERVOUS — anxiety and discipline. Read the first three chapters if you can.', pg_temp.shifted('2026-09-03T08:00:00')),
  ('00000000-0000-4003-a000-000000000002', '00000000-0000-4001-a000-000000000001', 'First session last week was genuinely the best conversation I''ve had since moving here.', pg_temp.shifted('2026-08-30T17:20:00')),
  ('00000000-0000-4003-a000-000000000003', '00000000-0000-4001-a000-000000000009', 'Booked Rochelle Canteen for next month — 8 spots, first come first served.', pg_temp.shifted('2026-09-01T12:00:00')),
  ('00000000-0000-4003-a000-000000000003', '00000000-0000-4001-a000-000000000007', 'Last night''s roast was so good. Already counting down to the next one.', pg_temp.shifted('2026-08-26T19:05:00')),
  ('00000000-0000-4003-a000-000000000004', '00000000-0000-4001-a000-000000000003', 'Sunrise walk Sunday in Richmond Park — Pembroke Lodge, 7:30am sharp.', pg_temp.shifted('2026-09-04T08:30:00')),
  ('00000000-0000-4003-a000-000000000004', '00000000-0000-4001-a000-000000000006', 'Anyone up for something longer this month? Thinking Epping Forest.', pg_temp.shifted('2026-08-29T17:20:00'));

-- Event group chat history (direct-message fixtures are not carried over)
insert into public.messages (conversation_id, sender_id, body, created_at)
select c.id, m.sender_id, m.body, m.created_at
from (values
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000010'::uuid, '欢迎大家 —— 这是周四国家美术馆导览的群聊，集合地点我会发在这里。', pg_temp.shifted('2026-09-05T09:00:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000010'::uuid, '集合地点：特拉法加广场正门柱廊下，下午 2:50，方便分发耳机。', pg_temp.shifted('2026-09-05T09:01:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000004'::uuid, '好的。有寄存处吗？我下班直接过去，会带包。', pg_temp.shifted('2026-09-05T09:14:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000010'::uuid, '有的，进门左手边有免费寄存，大包也必须寄存。', pg_temp.shifted('2026-09-05T09:16:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000008'::uuid, '可以拍照吗？如果可以我想拍透纳展厅。', pg_temp.shifted('2026-09-05T10:02:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000010'::uuid, '不能用闪光灯和三脚架，其他都可以。透纳是压轴，我们会在那儿待十分钟左右。', pg_temp.shifted('2026-09-05T10:05:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000005'::uuid, '结束后有人想去咖啡厅坐坐吗？我不急着走。', pg_temp.shifted('2026-09-05T11:20:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000001'::uuid, '我也去。', pg_temp.shifted('2026-09-05T11:26:00')),
  ('00000000-0000-4002-a000-000000000001'::uuid, '00000000-0000-4001-a000-000000000004'::uuid, '同去。周四见！', pg_temp.shifted('2026-09-05T11:31:00'))
) as m (event_id, sender_id, body, created_at)
join public.conversations c on c.event_id = m.event_id;

-- JJ has read everything except the last few messages, as in the prototype.
insert into public.conversation_reads (conversation_id, user_id, last_read_at)
select c.id, '00000000-0000-4001-a000-000000000001', pg_temp.shifted('2026-09-05T10:05:00')
from public.conversations c
where c.event_id = '00000000-0000-4002-a000-000000000001';
