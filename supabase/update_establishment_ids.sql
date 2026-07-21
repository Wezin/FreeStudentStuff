-- Free Plug — align listing establishment_id values with curated registry
-- (src/features/listings/establishments.ts) so EstablishmentIcon resolves.
--
-- Each brand id matches a simple-icons slug served by /api/establishment-icon.
-- School ids use local crests in public/schools/.
-- Brands without a simple-icons entry are set to null (no icon rendered).
--
-- Safe to re-run.

begin;

-- ---------------------------------------------------------------------------
-- Schools (local crest icons)
-- ---------------------------------------------------------------------------

update listings set
  establishment_id = 'uottawa',
  updated_at = now()
where slug in (
  'university-preparation-info-sessions-across-canada',
  'career-corner-drop-in-session-in-person',
  'campus-tours-for-new-university-of-ottawa-students',
  'virtual-career-corner-drop-in-sessions',
  'international-get-together',
  'let-s-talk-immigration-weekly-virtual-q-a-sessions-for-students'
);

update listings set
  establishment_id = 'algonquin',
  updated_at = now()
where slug = 'job-search-networking-workshop';

update listings set
  establishment_id = 'carleton',
  updated_at = now()
where slug = 'kin-m-gawin-symposium';

-- Any listing tagged with a school but still missing an icon id
update listings set
  establishment_id = 'uottawa',
  updated_at = now()
where establishment_id is null
  and 'uOttawa' = any(tags);

update listings set
  establishment_id = 'algonquin',
  updated_at = now()
where establishment_id is null
  and 'Algonquin' = any(tags);

update listings set
  establishment_id = 'carleton',
  updated_at = now()
where establishment_id is null
  and 'Carleton' = any(tags);

-- ---------------------------------------------------------------------------
-- Brands with simple-icons logos
-- ---------------------------------------------------------------------------

update listings set establishment_id = 'applemusic', updated_at = now()
where slug = 'apple-music-student';

update listings set establishment_id = 'autodesk', updated_at = now()
where slug = 'autodesk-edu-access';

update listings set establishment_id = 'chessdotcom', updated_at = now()
where slug = 'chess-com-50pc-premium';

update listings set establishment_id = 'datacamp', updated_at = now()
where slug = 'datacamp-student-50pc';

update listings set establishment_id = 'evernote', updated_at = now()
where slug = 'evernote-40pc-professional';

update listings set establishment_id = 'figma', updated_at = now()
where slug = 'figma-education-plan';

update listings set establishment_id = 'github', updated_at = now()
where slug = 'github-student-developer-pack';

update listings set establishment_id = 'headspace', updated_at = now()
where slug = 'headspace-student-plan';

update listings set establishment_id = 'hp', updated_at = now()
where slug = '40pc-hp-student';

update listings set establishment_id = 'medium', updated_at = now()
where slug = 'medium-25pc';

update listings set establishment_id = 'namecheap', updated_at = now()
where slug = 'namecheap';

update listings set establishment_id = 'nordvpn', updated_at = now()
where slug = 'nordvpn-69pc';

update listings set establishment_id = 'notion', updated_at = now()
where slug in ('notion-edu', 'notion-free-plus-plan-for-students-and-student-organizations');

update listings set establishment_id = 'protonvpn', updated_at = now()
where slug = 'proton-vpn-70pc';

update listings set establishment_id = 'quizlet', updated_at = now()
where slug = 'quizlet-plus';

update listings set establishment_id = 'rakutenkobo', updated_at = now()
where slug = 'rakuten-kobo-30pc';

update listings set establishment_id = 'skillshare', updated_at = now()
where slug = 'skillshare-30pc-annual';

update listings set establishment_id = 'spotify', updated_at = now()
where slug = 'spotify-premium-student-discount';

update listings set establishment_id = 'squarespace', updated_at = now()
where slug = 'squarespace-50pc';

update listings set establishment_id = 'youtube', updated_at = now()
where slug = 'youtube-premium-student-discount';

-- ---------------------------------------------------------------------------
-- Brands without simple-icons entries — clear stale importer ids
-- ---------------------------------------------------------------------------

update listings set establishment_id = null, updated_at = now()
where slug in (
  'prime-student-us',
  'prime-video-us',
  'grubhub-prime',
  'fizz-app',
  'calm-prime-student',
  'aws-educate',
  'ynab-college',
  'airalo-15pc',
  'hulu-199',
  'free-msft-365',
  'lingvist-50pc',
  'free-resume-builder',
  'blinkist-premium-25pc',
  'blinkist-get-40-off-premium-pro-subscriptions',
  'craft-for-education',
  'peacock-66pc',
  'jotform-edu',
  'canva-free',
  'azure-for-students',
  '45pc-myprotein',
  'logitech-bts-24',
  'chegg-books',
  '25pc-chegg-study',
  'fotor-free',
  'nutribullet-21pc',
  '21pc-nutribullet',
  'lucidchart-edu',
  'unidays-student-discounts',
  'the-economist-student-subscription-deal',
  'the-tremble-ritual-pilates-and-plunge',
  'amazon-prime-for-students-6-month-free-trial-half-price'
);

-- Catch remaining importer ids that don't match the curated registry
update listings set establishment_id = null, updated_at = now()
where establishment_id is not null
  and establishment_id not in (
    'carleton', 'uottawa', 'algonquin',
    'applemusic', 'autodesk', 'chessdotcom', 'datacamp', 'discord',
    'doordash', 'evernote', 'facebook', 'figma', 'github', 'headspace',
    'hp', 'instagram', 'kfc', 'mcdonalds', 'medium', 'namecheap', 'netflix',
    'nordvpn', 'notion', 'protonvpn', 'quizlet', 'rakutenkobo', 'shopify',
    'skillshare', 'snapchat', 'spotify', 'squarespace', 'starbucks', 'tiktok',
    'twitch', 'ubereats', 'x', 'youtube', 'airbnb'
  );

commit;
