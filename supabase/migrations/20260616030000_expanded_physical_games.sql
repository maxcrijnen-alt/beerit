-- Expanded physical game library: eight new offline games with beginner-
-- friendly instructions and winner/2nd/3rd point rules. Covers no-equipment
-- challenges (OTHER) plus extra card, board, and dice games.
-- Uses a fresh UUID block (…0200+) to avoid collisions with existing seeds.
-- All Beerits are fictional in-game penalty points: no wagers, debts, payouts,
-- or real-world rewards.

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
  -- OTHER activity kind: no-equipment physical challenges
  (
    '10000000-0000-4000-8000-000000000200',
    'Arm Wrestling Gauntlet',
    'A quick knockout arm wrestling tournament that needs no equipment.',
    'Challenges',
    'No equipment, upper-body strength',
    'Funny',
    2,
    12,
    15,
    'Pair players randomly. Each match is decided by arm wrestling (agree on right or left arm before the first round). The loser is out, the winner advances. Continue until one player remains. Scoring: winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000201',
    'Thumb War Championship',
    'Classic thumb wrestling run as a fast single-elimination bracket.',
    'Challenges',
    'No equipment, quick elimination',
    'Soft',
    2,
    10,
    10,
    'Chant "one, two, three, four, I declare a thumb war" then try to pin your opponent''s thumb for a count of three. First to three pins wins the match. Pair players randomly and run a single-elimination bracket. Scoring: winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000202',
    'Rock Paper Scissors Sprint',
    'Rock paper scissors as a rapid best-of-five elimination bracket.',
    'Challenges',
    'No equipment, reflexes and bluffing',
    'Soft',
    2,
    16,
    10,
    'Pair players randomly. Play best-of-five rock paper scissors: both players show a sign on a count of three. Rock beats scissors, scissors beats paper, paper beats rock. Replay ties immediately. The winner advances in a single-elimination bracket. Scoring: winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000203',
    'Staring Contest',
    'Hold eye contact the longest in this calm, silly, equipment-free duel.',
    'Challenges',
    'No equipment, unblinking focus',
    'Soft',
    2,
    8,
    10,
    'Two players face each other and keep eye contact. No blinking and no looking away. The first to blink or look away loses. Run a single-elimination bracket, or a round-robin for small groups. Scoring: last player unbeaten 0 Beerits, second-to-last 1, everyone else 2. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000204',
    'Coin Flip Streak',
    'Predict each coin flip correctly to stay in the game. Needs one coin.',
    'Challenges',
    'One coin, quick prediction game',
    'Soft',
    2,
    12,
    10,
    'You need one coin. Each round the host flips it. Before the flip, every remaining player secretly predicts heads or tails by raising one finger for heads or two for tails. Players who guess wrong are out. Keep flipping until one player remains; if several survive a flip, keep going. Scoring: last player standing 0 Beerits, second-to-last 1, everyone else 2. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  ),
  -- Additional CARD_GAME
  (
    '10000000-0000-4000-8000-000000000205',
    'Snap Race',
    'Lightning-fast snap with a standard deck. First to win every card wins.',
    'Card Games',
    'Standard deck, reaction speed',
    'Funny',
    2,
    8,
    15,
    'Use a standard deck dealt evenly and face down. Players take turns flipping their top card onto a central pile. When two cards in a row match in value, the first to shout "Snap!" and slap the pile takes the whole pile. Run out of cards and you are out. The player holding all the cards wins. Scoring: winner 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3, last player 5. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  ),
  -- Additional BOARD_GAME (paper and pen only)
  (
    '10000000-0000-4000-8000-000000000206',
    'Tic-Tac-Toe Speed Ladder',
    'Best-of-three tic-tac-toe in a fast ladder. Only needs paper and a pen.',
    'Board Games',
    'Paper and pen, fast rounds',
    'Soft',
    2,
    10,
    10,
    'You need paper and a pen. Each pair plays best-of-three tic-tac-toe, alternating who goes first between games. The player who wins more of the three games wins the match. Run a single-elimination bracket, or a round-robin if time allows. Scoring: winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
  ),
  -- Additional DICE_GAME
  (
    '10000000-0000-4000-8000-000000000207',
    'Three Dice Bingo',
    'Cross off numbers as three dice are rolled. Needs three dice and paper.',
    'Dice Games',
    'Three dice, luck and counting',
    'Soft',
    2,
    12,
    15,
    'You need three six-sided dice and something to write with. Each player secretly writes nine different numbers from 3 to 18 in a three-by-three grid. The host rolls all three dice each round and calls the total. Anyone with that number crosses it out. The first player to cross out a full row of three calls "Bingo!" and wins; simultaneous callers both win. Scoring: winner 0 Beerits, 2nd place 1, 3rd place 2, everyone else 3. Beerits are fictional in-game penalty points with no real-world value.',
    'PUBLIC'
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
  visibility = excluded.visibility;

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
  -- Arm Wrestling Gauntlet
  (
    '60000000-0000-4000-8000-000000000200',
    '10000000-0000-4000-8000-000000000200',
    'Run the Arm Wrestling Gauntlet. Pair everyone up at random, then play a single-elimination bracket. Winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000201',
    '10000000-0000-4000-8000-000000000200',
    'Sudden-death rematch: the two players with the most Beerits arm wrestle. The loser gets 2 more Beerits, the winner gets 0.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    2,
    2
  ),
  -- Thumb War Championship
  (
    '60000000-0000-4000-8000-000000000202',
    '10000000-0000-4000-8000-000000000201',
    'Hold the Thumb War Championship. Pair everyone randomly in a single-elimination bracket. Winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000203',
    '10000000-0000-4000-8000-000000000201',
    'Grudge match: the two players knocked out earliest face off. The loser gets 2 more Beerits.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    2,
    2
  ),
  -- Rock Paper Scissors Sprint
  (
    '60000000-0000-4000-8000-000000000204',
    '10000000-0000-4000-8000-000000000202',
    'Hold the Rock Paper Scissors Sprint bracket. Pair randomly, single elimination, best-of-five per match. Winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000205',
    '10000000-0000-4000-8000-000000000202',
    'Instant playoff: everyone throws a sign at once. Anyone who throws the least common sign gets 1 Beerit. Replay ties until resolved.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    1,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000206',
    '10000000-0000-4000-8000-000000000202',
    'Best-of-nine rock paper scissors between the two players leading in Beerits. The loser gets 3 more Beerits.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    3,
    3
  ),
  -- Staring Contest
  (
    '60000000-0000-4000-8000-000000000207',
    '10000000-0000-4000-8000-000000000203',
    'Hold a staring contest bracket. Two players duel at a time; the loser is out. The last player unbeaten gets 0 Beerits, everyone else 2.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    2,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000208',
    '10000000-0000-4000-8000-000000000203',
    'Straight-face duel: both players keep eye contact and a straight face. The first to smile or blink loses and gets 2 Beerits.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    2,
    2
  ),
  -- Coin Flip Streak
  (
    '60000000-0000-4000-8000-000000000209',
    '10000000-0000-4000-8000-000000000204',
    'Play Coin Flip Streak. Everyone predicts each flip; a wrong guess knocks you out. Last player standing 0 Beerits, everyone else 2.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    2,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000210',
    '10000000-0000-4000-8000-000000000204',
    'Double-or-nothing flip: the player with the most Beerits calls the next flip. Correct and they lose 1 Beerit; wrong and they gain 2.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    2,
    2
  ),
  -- Snap Race
  (
    '60000000-0000-4000-8000-000000000211',
    '10000000-0000-4000-8000-000000000205',
    'Play a full round of Snap Race until one player holds every card. Winner 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3, last player 5.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    5,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000212',
    '10000000-0000-4000-8000-000000000205',
    'Speed Snap: two randomly chosen players share one pile. The winner faces the next challenger. Beat three opponents in a row for 0 Beerits, everyone else 2.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    2,
    2
  ),
  -- Tic-Tac-Toe Speed Ladder
  (
    '60000000-0000-4000-8000-000000000213',
    '10000000-0000-4000-8000-000000000206',
    'Play the Tic-Tac-Toe Speed Ladder. Each pair plays best-of-three in a single-elimination bracket. Winner 0 Beerits, finalist 1, semi-finalists 2, everyone else 3.',
    'ACTIVITY',
    'BOARD_GAME',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000214',
    '10000000-0000-4000-8000-000000000206',
    'Draw challenge: both players aim for a draw in one tic-tac-toe game. The first player to actually win gets 3 Beerits for playing too aggressively.',
    'ACTIVITY',
    'BOARD_GAME',
    'Funny',
    3,
    2
  ),
  -- Three Dice Bingo
  (
    '60000000-0000-4000-8000-000000000215',
    '10000000-0000-4000-8000-000000000207',
    'Play Three Dice Bingo. Everyone writes nine numbers; the host rolls three dice and calls the total each round. First full row wins. Winner 0 Beerits, 2nd place 1, 3rd place 2, everyone else 3.',
    'ACTIVITY',
    'DICE_GAME',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000216',
    '10000000-0000-4000-8000-000000000207',
    'Sabotage round: before the next game each player crosses one number off a neighbour''s grid, then play as normal. The lowest-ranked player gets 3 Beerits.',
    'ACTIVITY',
    'DICE_GAME',
    'Funny',
    3,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000217',
    '10000000-0000-4000-8000-000000000207',
    'Speed bingo: one row of three numbers each. The first to cross out their whole row gets 0 Beerits, everyone else 2.',
    'ACTIVITY',
    'DICE_GAME',
    'Soft',
    2,
    3
  )
on conflict (id) do update
set
  game_id = excluded.game_id,
  text = excluded.text,
  card_type = excluded.card_type,
  activity_kind = excluded.activity_kind,
  intensity = excluded.intensity,
  beerits_value = excluded.beerits_value,
  position = excluded.position;
