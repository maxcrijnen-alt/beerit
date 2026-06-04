insert into public.games (
  id,
  title,
  description,
  category,
  intensity,
  min_players,
  estimated_duration,
  rules,
  visibility,
  plays_count
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Truth or Dare: Student Edition',
    'Light truths and dares for a relaxed start to the night.',
    'Truth or Dare',
    'Funny',
    3,
    20,
    'Take turns drawing a card. Answer the truth or complete the dare. If you refuse, receive the listed Beerits.',
    'PUBLIC',
    124
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never Have I Ever: Pre-Drinks',
    'Quick confessions and familiar student-night moments.',
    'Never Have I Ever',
    'Spicy',
    3,
    20,
    'Read the statement. Anyone who has done it receives 1 Beerit. Players may skip if they want.',
    'PUBLIC',
    187
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most Likely To: Chaos Edition',
    'Vote for the friend most likely to cause tonight''s plot twist.',
    'Most Likely To',
    'Chaos',
    4,
    20,
    'Read the prompt. Everyone votes. The chosen player receives the listed Beerits.',
    'PUBLIC',
    243
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would You Rather: Party Edition',
    'Pick a side and discover which friends think alike.',
    'Would You Rather',
    'Funny',
    2,
    15,
    'Read the choice. Everyone answers. Anyone in the minority receives 1 Beerit.',
    'PUBLIC',
    96
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Challenges: House Party Mode',
    'Low-pressure group challenges for a house-party setting.',
    'Challenges',
    'Soft',
    3,
    20,
    'Draw a challenge card. Complete the challenge or receive the listed Beerits.',
    'PUBLIC',
    154
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  intensity = excluded.intensity,
  min_players = excluded.min_players,
  estimated_duration = excluded.estimated_duration,
  rules = excluded.rules,
  visibility = excluded.visibility,
  plays_count = excluded.plays_count;

delete from public.game_cards
where game_id in (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000005'
);

insert into public.game_cards (
  game_id,
  text,
  card_type,
  intensity,
  beerits_value,
  position
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Tell the group your most embarrassing night-out story. Receive 2 Beerits if you skip.',
    'QUESTION',
    'Funny',
    2,
    1
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'Let the group choose your next profile picture for 10 minutes. Receive 3 Beerits if you skip.',
    'DARE',
    'Funny',
    3,
    2
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'Who in this room would survive the longest at a festival?',
    'QUESTION',
    'Funny',
    1,
    3
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'Give a dramatic toast to the person on your left.',
    'DARE',
    'Soft',
    1,
    4
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'What is the worst excuse you ever used to cancel plans?',
    'QUESTION',
    'Funny',
    1,
    5
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'Speak in an accent until your next turn. Receive 2 Beerits if you break character.',
    'DARE',
    'Funny',
    2,
    6
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'Who here would you trust least with your phone unlocked?',
    'QUESTION',
    'Spicy',
    1,
    7
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    'Swap seats with someone and act like them for one round.',
    'DARE',
    'Funny',
    1,
    8
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever texted an ex after midnight.',
    'QUESTION',
    'Spicy',
    1,
    1
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever lied to get into a club.',
    'QUESTION',
    'Spicy',
    1,
    2
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever pretended to know a song everyone else knew.',
    'QUESTION',
    'Funny',
    1,
    3
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever left a party without saying goodbye.',
    'QUESTION',
    'Funny',
    1,
    4
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever forgotten someone''s name immediately after meeting them.',
    'QUESTION',
    'Funny',
    1,
    5
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever been asked to leave somewhere.',
    'QUESTION',
    'Spicy',
    1,
    6
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever had a crush on a friend''s friend.',
    'QUESTION',
    'Spicy',
    1,
    7
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Never have I ever made plans and instantly regretted it.',
    'QUESTION',
    'Funny',
    1,
    8
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to lose their phone tonight? The chosen player receives 2 Beerits.',
    'VOTE',
    'Funny',
    2,
    1
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to accidentally start a group argument? The chosen player receives 2 Beerits.',
    'VOTE',
    'Chaos',
    2,
    2
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to become friends with a stranger in the bathroom queue? The chosen player receives 1 Beerit.',
    'VOTE',
    'Funny',
    1,
    3
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to miss the last train? The chosen player receives 3 Beerits.',
    'VOTE',
    'Chaos',
    3,
    4
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to order food before the night even starts? The chosen player receives 1 Beerit.',
    'VOTE',
    'Funny',
    1,
    5
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to tell the same story three times? The chosen player receives 2 Beerits.',
    'VOTE',
    'Funny',
    2,
    6
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to disappear for an hour and return with no explanation? The chosen player receives 3 Beerits.',
    'VOTE',
    'Chaos',
    3,
    7
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Most likely to become the DJ without permission? The chosen player receives 1 Beerit.',
    'VOTE',
    'Funny',
    1,
    8
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather be banned from your favorite bar or your favorite takeaway place?',
    'QUESTION',
    'Funny',
    1,
    1
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather only listen to one song all night or let your friends control your outfit?',
    'QUESTION',
    'Funny',
    1,
    2
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather have to dance every time someone says your name or sing every time you enter a room?',
    'QUESTION',
    'Funny',
    1,
    3
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather lose your keys every weekend or always have 1% phone battery?',
    'QUESTION',
    'Funny',
    1,
    4
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather go out in pajamas or wear sunglasses indoors all night?',
    'QUESTION',
    'Funny',
    1,
    5
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather always arrive too early or always arrive too late?',
    'QUESTION',
    'Soft',
    1,
    6
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather have your search history read aloud or your camera roll shown for 30 seconds?',
    'QUESTION',
    'Spicy',
    1,
    7
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Would you rather plan every night out or never be allowed to plan again?',
    'QUESTION',
    'Funny',
    1,
    8
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Everyone points to the messiest person. That person receives 2 Beerits.',
    'CHALLENGE',
    'Soft',
    2,
    1
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Make a toast to someone in the room. If the group says it needs work, receive 1 Beerit.',
    'CHALLENGE',
    'Soft',
    1,
    2
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Swap seats with someone and act like them for one round.',
    'CHALLENGE',
    'Funny',
    1,
    3
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Name everyone in the room in under 10 seconds or receive 2 Beerits.',
    'CHALLENGE',
    'Soft',
    2,
    4
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Let the person on your right choose your next challenge.',
    'CHALLENGE',
    'Soft',
    1,
    5
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Compliment three people in the room. If you repeat yourself, receive 1 Beerit.',
    'CHALLENGE',
    'Soft',
    1,
    6
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Do your best impression of someone famous. The group decides if you pass.',
    'CHALLENGE',
    'Funny',
    1,
    7
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    'Create a new rule for the next three rounds.',
    'RULE',
    'Soft',
    1,
    8
  );

insert into public.games (
  id,
  title,
  description,
  category,
  concept,
  intensity,
  min_players,
  max_players,
  estimated_duration,
  rules,
  visibility,
  plays_count
)
values (
  '10000000-0000-4000-8000-000000000090',
  'Bomb Mode',
  'Hot-potato category rounds with a random timer. Whoever holds the phone when time runs out receives 1 fictional Beerit.',
  'Challenges',
  'Hot potato random timer',
  'Funny',
  2,
  20,
  15,
  'Pass the phone around the circle while answering the prompt on the card. Answers must be new and fit the category. When the timer ends, the host taps the player holding the phone to add 1 fictional Beerit and move to the next card. Players may skip uncomfortable prompts. No wagers, payouts, or real-world rewards are involved.',
  'PUBLIC',
  0
)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  concept = excluded.concept,
  intensity = excluded.intensity,
  min_players = excluded.min_players,
  max_players = excluded.max_players,
  estimated_duration = excluded.estimated_duration,
  rules = excluded.rules,
  visibility = excluded.visibility,
  plays_count = excluded.plays_count;

insert into public.game_cards (
  id,
  game_id,
  text,
  card_type,
  intensity,
  beerits_value,
  timer_behavior,
  timer_min_seconds,
  timer_max_seconds,
  position
)
values
  (
    '60000000-0000-4000-8000-000000000090',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming snacks. No repeats.',
    'TIMED_EVENT',
    'Soft',
    1,
    'RANDOM_BOMB',
    20,
    180,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000091',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming cities. The group may reject unclear answers.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000092',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming things you find in a student house.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    3
  ),
  (
    '60000000-0000-4000-8000-000000000093',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming songs most people know.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    4
  ),
  (
    '60000000-0000-4000-8000-000000000094',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while giving harmless compliments. No repeating compliments.',
    'TIMED_EVENT',
    'Soft',
    1,
    'RANDOM_BOMB',
    20,
    180,
    5
  ),
  (
    '60000000-0000-4000-8000-000000000095',
    '10000000-0000-4000-8000-000000000090',
    'Pass the phone while naming board, card, or dice games.',
    'TIMED_EVENT',
    'Funny',
    1,
    'RANDOM_BOMB',
    20,
    180,
    6
  )
on conflict (id) do update
set
  game_id = excluded.game_id,
  text = excluded.text,
  card_type = excluded.card_type,
  intensity = excluded.intensity,
  beerits_value = excluded.beerits_value,
  timer_behavior = excluded.timer_behavior,
  timer_min_seconds = excluded.timer_min_seconds,
  timer_max_seconds = excluded.timer_max_seconds,
  position = excluded.position;
