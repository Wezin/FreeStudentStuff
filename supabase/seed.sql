-- Free Plug — V1 seed data
-- Run after schema.sql. Safe to re-run (uses ON CONFLICT on the unique slug).

insert into listings (
  title, slug, description, listing_type, location, starts_at, ends_at,
  tags, thumbnail_url, source_url, cta_label, establishment_id, establishment_name,
  status, is_featured
) values
(
  'Free Pizza Friday at Carleton',
  'free-pizza-friday-carleton',
  'CUSA is handing out free pizza on the fourth floor of University Centre. First come, first served, while supplies last. Bring your student ID.',
  'event', 'University Centre, Carleton University',
  now() + interval '2 days', now() + interval '2 days 3 hours',
  array['Free Food', 'Carleton'],
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/carleton/free-pizza-friday',
  'Open Link', 'carleton', 'CUSA',
  'published', true
),
(
  'uOttawa Welcome Back BBQ',
  'uottawa-welcome-back-bbq',
  'Free burgers, veggie dogs, and drinks on Tabaret Lawn to kick off the semester. Live music and student club booths all afternoon.',
  'event', 'Tabaret Lawn, University of Ottawa',
  now() + interval '5 days', now() + interval '5 days 4 hours',
  array['Events', 'uOttawa'],
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/uottawa/welcome-bbq',
  'View Event', 'uottawa', 'uOttawa Student Life',
  'published', true
),
(
  '20% Off Student Combos at Mello''s Diner',
  'mellos-diner-student-discount',
  'Show any Ottawa post-secondary student ID and get 20% off any combo meal, all day every day. Stacks with the Tuesday wing special.',
  'deal', 'Bank Street, Ottawa',
  null, now() + interval '90 days',
  array['Deals', 'Ottawa-wide'],
  'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/deals/mellos-diner',
  'Claim Deal', null, 'Mello''s Diner',
  'published', true
),
(
  'Algonquin Hack the Valley Hackathon',
  'algonquin-hack-the-valley',
  '24-hour beginner-friendly hackathon hosted by the Algonquin Computer Science Society. Free meals, mentors, prizes, and swag for every team.',
  'event', 'Algonquin College, Woodroffe Campus',
  now() + interval '14 days', now() + interval '15 days',
  array['Hackathons', 'Algonquin'],
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/algonquin/hack-the-valley',
  'Register', 'algonquin', 'Algonquin CS Society',
  'published', true
),
(
  'NSERC Undergraduate Research Scholarship Info Session',
  'nserc-usra-info-session',
  'Learn how to apply for the NSERC Undergraduate Student Research Award, eligibility requirements, and tips from past recipients across Ottawa schools.',
  'event', 'Online webinar',
  now() + interval '8 days', now() + interval '8 days 1 hour',
  array['Scholarships', 'Ottawa-wide'],
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/scholarships/nserc-usra',
  'Learn More', null, 'Ottawa STEM Network',
  'published', false
),
(
  'Carleton Women in Engineering Club Open House',
  'carleton-wie-open-house',
  'Meet the Women in Engineering executive team, learn about mentorship programs, and find out how to get involved this year. Free snacks provided.',
  'event', 'Canal Building, Carleton University',
  now() + interval '3 days', now() + interval '3 days 2 hours',
  array['Clubs', 'Carleton'],
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/carleton/wie-open-house',
  'Learn More', 'carleton', 'Carleton WIE',
  'published', false
),
(
  'Free Exam De-Stress Kits at uOttawa Library',
  'uottawa-library-destress-kits',
  'Pick up a free de-stress kit with snacks, tea, and earplugs at the Morisset Library front desk during exam season. While supplies last.',
  'event', 'Morisset Library, University of Ottawa',
  now() + interval '1 day', now() + interval '6 days',
  array['Free Food', 'uOttawa'],
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/uottawa/destress-kits',
  'Open Link', 'uottawa', 'uOttawa Library',
  'published', false
),
(
  'Summer Marketing Internship — Ottawa Startup',
  'ottawa-startup-marketing-internship',
  'A local Ottawa startup is hiring a part-time marketing intern for the summer term. Open to students from any Ottawa post-secondary school.',
  'deal', 'Hybrid — Ottawa, ON',
  null, now() + interval '30 days',
  array['Opportunities', 'Ottawa-wide'],
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/opportunities/marketing-internship',
  'Apply', null, 'Ottawa Startup Collective',
  'published', false
),
(
  'Algonquin Pancake Breakfast Fundraiser',
  'algonquin-pancake-breakfast',
  'Free pancakes for students, donations welcome for the Algonquin Food Cupboard. Hosted by the Student Association in the Student Commons.',
  'event', 'Student Commons, Algonquin College',
  now() + interval '4 days', now() + interval '4 days 3 hours',
  array['Free Food', 'Algonquin'],
  'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/algonquin/pancake-breakfast',
  'Open Link', 'algonquin', 'Algonquin Students'' Association',
  'published', false
),
(
  'Carleton Career Fair — All Faculties',
  'carleton-career-fair',
  'Over 80 employers on campus for the fall career fair. Free professional headshots and resume reviews available on-site, no registration required.',
  'event', 'Fieldhouse, Carleton University',
  now() + interval '10 days', now() + interval '10 days 6 hours',
  array['Events', 'Carleton'],
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/carleton/career-fair',
  'View Event', 'carleton', 'Carleton Career Services',
  'published', false
),
(
  'Buy One Get One Coffee — Grind House Cafe',
  'grind-house-cafe-bogo-coffee',
  'Flash student deal: buy one coffee, get one free every weekday before 11am. Just mention Free Plug at the counter.',
  'deal', 'Rideau Street, Ottawa',
  null, now() + interval '45 days',
  array['Deals', 'uOttawa'],
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/deals/grind-house-cafe',
  'Claim Deal', null, 'Grind House Cafe',
  'published', true
),
(
  'uOttawa Debate Club Recruitment Night',
  'uottawa-debate-club-recruitment',
  'No experience needed. Come try competitive debate, meet the executive team, and find out about regional tournaments this year.',
  'event', 'FSS Building, University of Ottawa',
  now() + interval '6 days', now() + interval '6 days 2 hours',
  array['Clubs', 'uOttawa'],
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/uottawa/debate-club',
  'Learn More', 'uottawa', 'uOttawa Debate Society',
  'published', false
),
(
  'Ottawa Tech Week Student Pass',
  'ottawa-tech-week-student-pass',
  'Free student passes for Ottawa Tech Week, including panels, workshops, and the closing night demo showcase. Limited passes available.',
  'event', 'Various venues, Ottawa',
  now() + interval '21 days', now() + interval '25 days',
  array['Events', 'Ottawa-wide'],
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/events/ottawa-tech-week',
  'Register', null, 'Ottawa Tech Week',
  'published', true
),
(
  'Algonquin Bursary for New Canadians',
  'algonquin-bursary-new-canadians',
  'A bursary supporting newcomer students at Algonquin College with tuition and living costs. Applications reviewed on a rolling basis.',
  'deal', 'Algonquin College, Woodroffe Campus',
  null, now() + interval '60 days',
  array['Scholarships', 'Algonquin'],
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/scholarships/algonquin-bursary',
  'Apply', 'algonquin', 'Algonquin Foundation',
  'published', false
),
(
  'Free Yoga on the Quad — Carleton',
  'carleton-free-yoga-quad',
  'Drop-in outdoor yoga session, mats provided. Beginners welcome, hosted by Carleton Recreation every Wednesday this month.',
  'event', 'The Quad, Carleton University',
  now() + interval '2 days', now() + interval '2 days 1 hour',
  array['Events', 'Carleton'],
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/carleton/free-yoga',
  'View Event', 'carleton', 'Carleton Recreation',
  'published', false
),
(
  'Ottawa Student Volunteer Fair',
  'ottawa-student-volunteer-fair',
  'Connect with over 40 local non-profits looking for student volunteers. Great for building experience and community connections.',
  'event', 'Ottawa City Hall',
  now() + interval '12 days', now() + interval '12 days 5 hours',
  array['Opportunities', 'Ottawa-wide'],
  'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/opportunities/volunteer-fair',
  'Learn More', null, 'Volunteer Ottawa',
  'published', false
),
(
  'uOttawa AI Hackathon: GeeseHacks',
  'uottawa-geesehacks',
  'A weekend hackathon for students of all skill levels focused on AI and machine learning projects. Free meals and mentorship from local tech companies.',
  'event', 'STEM Complex, University of Ottawa',
  now() + interval '18 days', now() + interval '19 days',
  array['Hackathons', 'uOttawa'],
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/uottawa/geesehacks',
  'Register', 'uottawa', 'uOttawa AI Society',
  'published', false
),
(
  'Free Movie Night — Algonquin Student Commons',
  'algonquin-free-movie-night',
  'Free popcorn and a student-voted movie screening in the Student Commons. Doors open 30 minutes before showtime.',
  'event', 'Student Commons, Algonquin College',
  now() + interval '9 days', now() + interval '9 days 3 hours',
  array['Events', 'Algonquin'],
  'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/algonquin/movie-night',
  'View Event', 'algonquin', 'Algonquin Students'' Association',
  'published', false
),
(
  'Resume Review Drop-In — Any Ottawa School',
  'ottawa-resume-review-dropin',
  'Free resume and LinkedIn reviews from industry volunteers, open to students from Carleton, uOttawa, and Algonquin. No appointment needed.',
  'event', 'Ottawa Public Library, Main Branch',
  now() + interval '7 days', now() + interval '7 days 4 hours',
  array['Opportunities', 'Ottawa-wide'],
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
  'https://example.com/opportunities/resume-review',
  'Learn More', null, 'Ottawa Career Collective',
  'published', false
)
on conflict (slug) do nothing;

-- Admin login is configured via the ADMIN_PASSWORD / ADMIN_PASSWORD_SECRET
-- env vars — see .env.example. No database row is needed.
