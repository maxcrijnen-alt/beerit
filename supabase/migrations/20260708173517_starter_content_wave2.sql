-- Starter content wave 2: Bomb Mode showcase, voting, icebreaker,
-- conversation, road trip, dice, physical challenge, and manual scoreboard
-- templates. Beerits are fictional penalty points; nothing requires drinking.

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
  visibility
)
values
  (
    '10000000-0000-4000-8000-000000000100',
    'Pass the Bomb: Chaos Edition',
    'Hot-potato naming game. The timer is random, the phone keeps moving, and whoever holds it at BOOM loses the round.',
    'Challenges',
    'Hot potato with a hidden random timer',
    'Chaos',
    3,
    12,
    15,
    'The host phone shows a category and secretly starts a random timer. Say an answer that fits the category, then pass the phone to the next player. Hesitating, repeating an answer, or a wrong answer means you keep holding it. When BOOM appears, the player holding the phone loses the round and receives the Beerits shown on the card. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000101',
    'This or That: Party Vote',
    'Everyone votes at the same time. The minority takes the Beerits.',
    'Would You Rather',
    'Simultaneous group voting',
    'Funny',
    3,
    20,
    15,
    'Read the card out loud. On the count of three, everyone points left or right for their choice. Players in the minority receive 1 Beerit each. On a tie nobody scores. The host taps the loser side quickly using the scoreboard. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000102',
    'Two Truths and a Lie',
    'The classic icebreaker: spot the lie or take a fictional penalty point.',
    'Icebreakers',
    'Guess the lie',
    'Soft',
    3,
    15,
    20,
    'The player on the card tells three statements about themselves: two true, one false. Everyone else votes which statement is the lie. Wrong guessers receive 1 Beerit. If the majority guesses correctly, the storyteller receives 1 Beerit instead. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000103',
    'Hot Takes',
    'Bold conversation starters. Defend your take or lose the room.',
    'Conversation',
    'Debate-style prompts',
    'Spicy',
    3,
    12,
    25,
    'Read the prompt out loud. The player whose turn it is gives their honest take in thirty seconds. The group votes: convincing take means no Beerits, weak take means 1 Beerit. Keep it playful, keep it kind. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000104',
    'Road Trip Rally',
    'Spotting challenges for the road. First spotter wins, slowest player scores.',
    'Road Trip',
    'Spot-it-first travel game',
    'Soft',
    2,
    8,
    45,
    'Read the card out loud. The first player to spot the item on the card wins the round. The last player to spot it, or anyone who false-calls, receives 1 Beerit. The driver plays as referee and never as a player. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000105',
    'Mexen',
    'The classic bar dice game with two dice and nerves of steel.',
    'Dice Games',
    'Two dice, bluff and reveal',
    'Funny',
    2,
    10,
    20,
    'You need two dice and a cup. Roll hidden under the cup. The combination 2-1 is Mex, the highest roll. Doubles beat normal rolls (6-6 is the highest double), and normal rolls read highest die first (so 5-4 is 54). Each player rolls up to three times; you may stop early, and every player after you gets at most as many rolls as you used. The lowest roll of the round receives 1 Beerit; rolling Mex doubles the round penalty for the loser. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000106',
    'Cup Flip Relay',
    'Team relay: flip plastic cups from the table edge, fastest team wins.',
    'Challenges',
    'Team cup-flipping relay',
    'Funny',
    4,
    16,
    15,
    'Form two even teams, each with a row of plastic cups on the table edge — one cup per player. Water or empty cups both work; drinking is never required. On go, the first player flips their cup from the edge until it lands upside down, then the next teammate starts. The losing team receives 2 Beerits per player. Best of three rounds. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000107',
    'Beerit Scorekeeper',
    'A manual scoreboard for any game night: play anything, track fictional points here.',
    'Custom Rules',
    'Universal manual scoreboard',
    'Soft',
    2,
    20,
    60,
    'Use this room as a scoreboard while your group plays any game you like — cards, darts, video games, or your own house rules. Agree up front what earns a fictional Beerit, then let the host tap the loser after each round. The card stack contains generic round markers so you can keep playing as long as you want. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  );

-- Bomb Mode cards: hidden random timer between 20 and 180 seconds.
insert into public.game_cards (
  id,
  game_id,
  text,
  card_type,
  activity_kind,
  intensity,
  beerits_value,
  position,
  timer_behavior,
  timer_min_seconds,
  timer_max_seconds
)
values
  ('60000000-0000-4000-8000-000000000100', '10000000-0000-4000-8000-000000000100', 'Name pizza toppings. No repeats. Pass the phone after every answer.', 'TIMED_EVENT', null, 'Funny', 2, 1, 'RANDOM_BOMB', 20, 180),
  ('60000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000100', 'Name artists or bands everyone in the group knows.', 'TIMED_EVENT', null, 'Funny', 2, 2, 'RANDOM_BOMB', 20, 180),
  ('60000000-0000-4000-8000-000000000102', '10000000-0000-4000-8000-000000000100', 'Name countries. One mistake and you keep the bomb.', 'TIMED_EVENT', null, 'Soft', 1, 3, 'RANDOM_BOMB', 20, 180),
  ('60000000-0000-4000-8000-000000000103', '10000000-0000-4000-8000-000000000100', 'Name words that rhyme with "night". Hesitate and hold it.', 'TIMED_EVENT', null, 'Chaos', 4, 4, 'RANDOM_BOMB', 20, 180),
  ('60000000-0000-4000-8000-000000000104', '10000000-0000-4000-8000-000000000100', 'Name famous movie quotes. Repeat one and you keep holding.', 'TIMED_EVENT', null, 'Spicy', 3, 5, 'RANDOM_BOMB', 20, 180),
  ('60000000-0000-4000-8000-000000000105', '10000000-0000-4000-8000-000000000100', 'Name things you would bring to a desert island.', 'TIMED_EVENT', null, 'Soft', 1, 6, 'RANDOM_BOMB', 20, 180),
  ('60000000-0000-4000-8000-000000000106', '10000000-0000-4000-8000-000000000100', 'Name embarrassing ringtones, sounds, or notification noises — and imitate them.', 'TIMED_EVENT', null, 'Chaos', 4, 7, 'RANDOM_BOMB', 20, 180),
  ('60000000-0000-4000-8000-000000000107', '10000000-0000-4000-8000-000000000100', 'Name sports. Fake sports count if the group laughs.', 'TIMED_EVENT', null, 'Funny', 2, 8, 'RANDOM_BOMB', 20, 180);

insert into public.game_cards (
  id,
  game_id,
  text,
  card_type,
  activity_kind,
  intensity,
  beerits_value,
  position
)
values
  -- This or That: Party Vote
  ('60000000-0000-4000-8000-000000000110', '10000000-0000-4000-8000-000000000101', 'Beach holiday or city trip? Point left for beach, right for city. Minority takes 1 Beerit.', 'VOTE', null, 'Soft', 1, 1),
  ('60000000-0000-4000-8000-000000000111', '10000000-0000-4000-8000-000000000101', 'Text back instantly or leave everyone on read for hours?', 'VOTE', null, 'Funny', 1, 2),
  ('60000000-0000-4000-8000-000000000112', '10000000-0000-4000-8000-000000000101', 'Never party again or party every single weekend forever?', 'VOTE', null, 'Funny', 1, 3),
  ('60000000-0000-4000-8000-000000000113', '10000000-0000-4000-8000-000000000101', 'Karaoke solo in front of strangers or dance solo in front of colleagues?', 'VOTE', null, 'Spicy', 1, 4),
  ('60000000-0000-4000-8000-000000000114', '10000000-0000-4000-8000-000000000101', 'Know how every argument ends or how every party ends?', 'VOTE', null, 'Funny', 1, 5),
  ('60000000-0000-4000-8000-000000000115', '10000000-0000-4000-8000-000000000101', 'Lose your phone for a week or your keys every day for a month?', 'VOTE', null, 'Soft', 1, 6),
  ('60000000-0000-4000-8000-000000000116', '10000000-0000-4000-8000-000000000101', 'Always say what you think or never be able to speak first?', 'VOTE', null, 'Spicy', 1, 7),
  ('60000000-0000-4000-8000-000000000117', '10000000-0000-4000-8000-000000000101', 'Front row at every concert or backstage at one concert of your choice?', 'VOTE', null, 'Soft', 1, 8),
  -- Two Truths and a Lie
  ('60000000-0000-4000-8000-000000000120', '10000000-0000-4000-8000-000000000102', 'Youngest player: tell two truths and one lie. The group votes on the lie.', 'QUESTION', null, 'Soft', 1, 1),
  ('60000000-0000-4000-8000-000000000121', '10000000-0000-4000-8000-000000000102', 'Player holding the phone: two truths and a lie about your travels.', 'QUESTION', null, 'Soft', 1, 2),
  ('60000000-0000-4000-8000-000000000122', '10000000-0000-4000-8000-000000000102', 'Two truths and a lie about your childhood. Storyteller picks who guesses first.', 'QUESTION', null, 'Funny', 1, 3),
  ('60000000-0000-4000-8000-000000000123', '10000000-0000-4000-8000-000000000102', 'Two truths and a lie about famous people you have met or almost met.', 'QUESTION', null, 'Funny', 1, 4),
  ('60000000-0000-4000-8000-000000000124', '10000000-0000-4000-8000-000000000102', 'Two truths and a lie about your worst kitchen disasters.', 'QUESTION', null, 'Funny', 1, 5),
  ('60000000-0000-4000-8000-000000000125', '10000000-0000-4000-8000-000000000102', 'Two truths and a lie about school. The group may ask one follow-up question.', 'QUESTION', null, 'Soft', 1, 6),
  -- Hot Takes
  ('60000000-0000-4000-8000-000000000130', '10000000-0000-4000-8000-000000000103', 'Hot take: pineapple on pizza is elite. Defend or destroy in 30 seconds.', 'QUESTION', null, 'Funny', 1, 1),
  ('60000000-0000-4000-8000-000000000131', '10000000-0000-4000-8000-000000000103', 'Hot take: arriving early to a party is worse than arriving very late.', 'QUESTION', null, 'Funny', 1, 2),
  ('60000000-0000-4000-8000-000000000132', '10000000-0000-4000-8000-000000000103', 'Hot take: group chats should legally require a weekly cleanup.', 'QUESTION', null, 'Soft', 1, 3),
  ('60000000-0000-4000-8000-000000000133', '10000000-0000-4000-8000-000000000103', 'Hot take: your music taste peaked in high school. Prove otherwise.', 'QUESTION', null, 'Spicy', 1, 4),
  ('60000000-0000-4000-8000-000000000134', '10000000-0000-4000-8000-000000000103', 'Hot take: breakfast food beats dinner food. Fight it out.', 'QUESTION', null, 'Soft', 1, 5),
  ('60000000-0000-4000-8000-000000000135', '10000000-0000-4000-8000-000000000103', 'Hot take: the sequel is better than the original — pick any movie and defend it.', 'QUESTION', null, 'Funny', 1, 6),
  -- Road Trip Rally
  ('60000000-0000-4000-8000-000000000140', '10000000-0000-4000-8000-000000000104', 'First to spot a yellow car. Last spotter or false call: 1 Beerit.', 'CHALLENGE', null, 'Soft', 1, 1),
  ('60000000-0000-4000-8000-000000000141', '10000000-0000-4000-8000-000000000104', 'First to spot a license plate from another country.', 'CHALLENGE', null, 'Soft', 1, 2),
  ('60000000-0000-4000-8000-000000000142', '10000000-0000-4000-8000-000000000104', 'First to spot an animal that is not a bird.', 'CHALLENGE', null, 'Soft', 1, 3),
  ('60000000-0000-4000-8000-000000000143', '10000000-0000-4000-8000-000000000104', 'First to spot a gas station sign. Bonus: guess the fuel price within 10 cents.', 'CHALLENGE', null, 'Funny', 1, 4),
  ('60000000-0000-4000-8000-000000000144', '10000000-0000-4000-8000-000000000104', 'First to spot a truck with a company name containing the letter Z.', 'CHALLENGE', null, 'Funny', 1, 5),
  ('60000000-0000-4000-8000-000000000145', '10000000-0000-4000-8000-000000000104', 'First to spot a speed camera or police car. Everyone else: 1 Beerit.', 'CHALLENGE', null, 'Funny', 1, 6),
  -- Mexen (physical dice)
  ('60000000-0000-4000-8000-000000000150', '10000000-0000-4000-8000-000000000105', 'Play a round of Mexen. Lowest roll receives 1 Beerit; a Mex (2-1) doubles the round penalty for the loser.', 'ACTIVITY', 'DICE_GAME', 'Funny', 2, 1),
  -- Cup Flip Relay (physical challenge)
  ('60000000-0000-4000-8000-000000000151', '10000000-0000-4000-8000-000000000106', 'Run a Cup Flip Relay: two even teams, flip your cup from the table edge, fastest team wins. Losing team: 2 Beerits per player. Drinking is never required.', 'ACTIVITY', 'OTHER', 'Funny', 2, 1),
  -- Beerit Scorekeeper (manual scoreboard rounds)
  ('60000000-0000-4000-8000-000000000160', '10000000-0000-4000-8000-000000000107', 'Round 1: play your own game. Host taps the loser to award the agreed fictional Beerits.', 'MANUAL_SCORING_ACTION', null, 'Soft', 1, 1),
  ('60000000-0000-4000-8000-000000000161', '10000000-0000-4000-8000-000000000107', 'Round 2: same game or switch it up. Host scores the loser.', 'MANUAL_SCORING_ACTION', null, 'Soft', 1, 2),
  ('60000000-0000-4000-8000-000000000162', '10000000-0000-4000-8000-000000000107', 'Round 3: double round! Loser receives 2 fictional Beerits.', 'MANUAL_SCORING_ACTION', null, 'Funny', 2, 3),
  ('60000000-0000-4000-8000-000000000163', '10000000-0000-4000-8000-000000000107', 'Round 4: winner of the previous round picks the next game.', 'MANUAL_SCORING_ACTION', null, 'Soft', 1, 4),
  ('60000000-0000-4000-8000-000000000164', '10000000-0000-4000-8000-000000000107', 'Round 5: final round. Double points again — loser receives 2 fictional Beerits.', 'MANUAL_SCORING_ACTION', null, 'Funny', 2, 5);
