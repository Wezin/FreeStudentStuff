insert into listings (
  id, title, slug, description, listing_type, location, starts_at, ends_at,
  tags, thumbnail_url, source_url, cta_label, establishment_id, establishment_name,
  status, is_featured
) values (
  '7faf2d28-b74a-41ec-ac09-4e6e6b1b4643',
  'Design Tool with Free Education Plan',
  'figma-education-plan',
  'FIGMA FOR EDUCATION Figma and FigJam are design and collaboration software used by professional designers, engineers, and makers of all kinds. Use them to ideate, create, and share work—all free, as a student or teacher. FigJam is an online whiteboard where possibilities turn into plans. Teachers can facilitate collaborative group learning while encouraging active participation from students. It’s best suited for classroom discussions, brainstorms, and group work. Figma is a multiplayer, intuitive design tool used by professionals. Create graphics, presentations, prototypes, and more—all with real-time collaboration and feedback. Figma and FigJam live side by side so that students can turn their ideas into reality, faster. Dev Mode is a workspace in Figma to bring designs to production, faster. Students can inspect designs and get the details needed to build them. Dev Mode is great for learning how design concepts map to code concepts.',
  'deal', 'United States',
  null, null,
  array['Deals', 'UI kits', 'Icons'],
  'https://api.freeforstudents.org/assets/e0fd6971-2223-41ef-8c1a-ba2514c78849?format=auto&width=256',
  'https://www.figma.com/community/widgets',
  'Open Link', 'figma', 'Figma',
  'published', false
) on conflict (slug) do nothing;
