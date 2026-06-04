-- Expanded physical game library: eight new games covering OTHER activity kind
-- (no-equipment challenges), plus extra cards for card, board, and dice games.

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
    '10000000-0000-4000-8000-000000000017',
    'Arm Wrestling Gauntlet',
    'A quick knockout arm wrestling tournament requiring no equipment.',
    'Challenges',
    'No equipment, upper-body strength',
    'Funny',
    2,
    12,
    15,
    'Pair players randomly. Each match is decided by arm wrestling (right or left arm, agree before the first round). Loser is eliminated, winner advances. Continue until only one player remains. Beerits: winner 0, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000018',
    'Thumb War Championship',
    'Classic thumb wrestling played as a quick elimination tournament.',
    'Challenges',
    'No equipment, quick elimination',
    'Soft',
    2,
    10,
    10,
    'Count off "one, two, three, four, I declare a thumb war" and then try to pin your opponent''s thumb for a count of three. First to three pins wins the match. Pair players randomly and run a single-elimination bracket. Beerits: winner 0, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000019',
    'Rock Paper Scissors Sprint',
    'Rock-paper-scissors as a rapid best-of-five elimination bracket.',
    'Challenges',
    'No equipment, reflexes and bluffing',
    'Soft',
    2,
    16,
    10,
    'Pair players randomly. Play best-of-five Rock Paper Scissors: both players show a hand sign on a count of three. Rock beats Scissors, Scissors beats Paper, Paper beats Rock. Ties are replayed immediately. Winner advances in a single-elimination bracket. Beerits: winner 0, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000020',
    'Staring Contest',
    'Who can hold eye contact the longest? A calm, silly, equipment-free challenge.',
    'Challenges',
    'No equipment, unblinking focus',
    'Soft',
    2,
    8,
    10,
    'Two players face each other and maintain eye contact. No blinking, no looking away. The first player to blink or look away loses. Run a round-robin or elimination bracket depending on group size. Beerits: last player standing 0, second-to-last 1, everyone else 2. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  (
    '10000000-0000-4000-8000-000000000021',
    'Coin Flip Streak',
    'Predict a sequence of coin flips correctly to stay in the game.',
    'Challenges',
    'One coin, quick prediction game',
    'Soft',
    2,
    12,
    10,
    'You need one coin. Each round the host flips the coin. Before the flip, every remaining player secretly predicts heads or tails by raising one or two fingers (one = heads, two = tails). Players who guess wrong are eliminated. Keep flipping until one player remains. If multiple players survive the same flip, continue flipping. Beerits: last player standing 0, second-to-last 1, everyone else 2. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  -- Additional CARD_GAME
  (
    '10000000-0000-4000-8000-000000000022',
    'Snap Race',
    'Lightning-fast snap with a standard deck. First to collect all cards wins.',
    'Card Games',
    'Standard deck, reaction speed',
    'Funny',
    2,
    8,
    15,
    'Use a standard deck. Deal evenly face-down. Players take turns flipping their top card onto a central pile. When two consecutive cards match in value, the first player to shout "Snap!" and slap the pile wins the pile. If you run out of cards you are eliminated. The player who collects all cards wins. Beerits: winner 0, 2nd place 1, 3rd place 2, every lower place 3, last player 5. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  -- Additional BOARD_GAME (paper and pen only)
  (
    '10000000-0000-4000-8000-000000000023',
    'Tic-Tac-Toe Speed Ladder',
    'Best-of-three tic-tac-toe played in a round-robin ladder. All you need is paper and a pen.',
    'Board Games',
    'Paper and pen, fast rounds',
    'Soft',
    2,
    10,
    10,
    'You need paper and a pen. Each pair plays best-of-three tic-tac-toe. Alternate who goes first between games. The player who wins more games in the pair wins the match. Run a single-elimination bracket or round-robin if time allows. Beerits: winner 0, finalist 1, semi-finalists 2, everyone else 3. Beerits are fictional in-game penalty points.',
    'PUBLIC'
  ),
  -- Additional DICE_GAME
  (
    '10000000-0000-4000-8000-000000000024',
    'Three Dice Bingo',
    'Mark your mental bingo card as three dice are rolled. Fast, simple, needs only three dice.',
    'Dice Games',
    'Three dice, luck and counting',
    'Soft',
    2,
    12,
    15,
    'You need three six-sided dice and something to write with. Before the game each player secretly writes down nine unique numbers from 3 to 18 on a slip of paper (3 rows of 3). The host rolls all three dice each round and calls the sum. Anyone who has that number on their paper crosses it out. First player to cross out a full row calls "Bingo!" and wins. If two players call simultaneously, both win. Beerits: winner 0, 2nd place 1, 3rd place 2, everyone else 3. Beerits are fictional in-game penalty points.',
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
  -- Arm Wrestling Gauntlet cards
  (
    '60000000-0000-4000-8000-000000000015',
    '10000000-0000-4000-8000-000000000017',
    'Run the Arm Wrestling Gauntlet. Pair everyone up randomly, then run a single-elimination bracket. Winner gets 0 Beerits; finalist 1; semi-finalists 2; everyone else 3.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000016',
    '10000000-0000-4000-8000-000000000017',
    'Sudden-death arm wrestle: the two highest-Beerit players face off. Loser receives 2 more Beerits. Winner receives 0.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    2,
    2
  ),
  -- Thumb War Championship cards
  (
    '60000000-0000-4000-8000-000000000017',
    '10000000-0000-4000-8000-000000000018',
    'Hold the Thumb War Championship. Pair everyone randomly, single-elimination bracket. Winner 0 Beerits; finalist 1; semi-finalists 2; everyone else 3.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000018',
    '10000000-0000-4000-8000-000000000018',
    'Grudge match: the two players who lost earliest in the Championship face each other. Loser gets 2 more Beerits.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    2,
    2
  ),
  -- Rock Paper Scissors Sprint cards
  (
    '60000000-0000-4000-8000-000000000019',
    '10000000-0000-4000-8000-000000000019',
    'Hold the Rock Paper Scissors Sprint bracket. Pair randomly, single-elimination, best-of-five per match. Winner 0 Beerits; finalist 1; semi-finalists 2; everyone else 3.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000020',
    '10000000-0000-4000-8000-000000000019',
    'Instant playoff: every player simultaneously throws a sign. Anyone who throws the least popular sign gets 1 Berit. Ties are replayed until resolved.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    1,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000021',
    '10000000-0000-4000-8000-000000000019',
    'Best-of-nine Rock Paper Scissors between the two players currently leading in Beerits. Loser receives 3 extra Beerits.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    3,
    3
  ),
  -- Staring Contest cards
  (
    '60000000-0000-4000-8000-000000000022',
    '10000000-0000-4000-8000-000000000020',
    'Hold a group staring contest. Two players face off at a time; loser is eliminated. Last player unblinking wins. Winner 0 Beerits; everyone else 2.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    2,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000023',
    '10000000-0000-4000-8000-000000000020',
    'Forced smile staring contest: both players must hold a straight face while maintaining eye contact. First to smile or blink loses and gets 2 Beerits.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    2,
    2
  ),
  -- Coin Flip Streak cards
  (
    '60000000-0000-4000-8000-000000000024',
    '10000000-0000-4000-8000-000000000021',
    'Play Coin Flip Streak. Everyone predicts each flip; wrong predictions eliminate you. Last player standing gets 0 Beerits; everyone else 2.',
    'ACTIVITY',
    'OTHER',
    'Soft',
    2,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000025',
    '10000000-0000-4000-8000-000000000021',
    'Double-or-nothing flip: the player with the most Beerits calls the flip. Correct: they lose 1 Berit. Wrong: they gain 2.',
    'ACTIVITY',
    'OTHER',
    'Funny',
    2,
    2
  ),
  -- Snap Race cards
  (
    '60000000-0000-4000-8000-000000000026',
    '10000000-0000-4000-8000-000000000022',
    'Play a full round of Snap Race until one player holds all the cards. Winner 0 Beerits; 2nd place 1; 3rd place 2; every lower place 3; last player 5.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    5,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000027',
    '10000000-0000-4000-8000-000000000022',
    'Speed Snap: play with only one pile shared between two randomly chosen players. The winner plays the next challenger. First to beat three opponents in a row gets 0 Beerits; everyone else gets 2.',
    'ACTIVITY',
    'CARD_GAME',
    'Funny',
    2,
    2
  ),
  -- Tic-Tac-Toe Speed Ladder cards
  (
    '60000000-0000-4000-8000-000000000028',
    '10000000-0000-4000-8000-000000000023',
    'Play the Tic-Tac-Toe Speed Ladder. Each pair plays best-of-three; run a single-elimination bracket. Winner 0 Beerits; finalist 1; semi-finalists 2; everyone else 3.',
    'ACTIVITY',
    'BOARD_GAME',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000029',
    '10000000-0000-4000-8000-000000000023',
    'Ultimate draw challenge: both players must try to force a draw in a single tic-tac-toe game. First player to win gets 3 Beerits for "playing too aggressively".',
    'ACTIVITY',
    'BOARD_GAME',
    'Funny',
    3,
    2
  ),
  -- Three Dice Bingo cards
  (
    '60000000-0000-4000-8000-000000000030',
    '10000000-0000-4000-8000-000000000024',
    'Play Three Dice Bingo. Everyone writes down nine numbers; host rolls three dice and calls the sum each round. First full row wins. Winner 0 Beerits; 2nd place 1; 3rd place 2; everyone else 3.',
    'ACTIVITY',
    'DICE_GAME',
    'Soft',
    3,
    1
  ),
  (
    '60000000-0000-4000-8000-000000000031',
    '10000000-0000-4000-8000-000000000024',
    'Sabotage round: before the next bingo game, each player may cross off one number from a neighbour''s card. Then play as normal. Lowest-ranked player gets 3 Beerits.',
    'ACTIVITY',
    'DICE_GAME',
    'Funny',
    3,
    2
  ),
  (
    '60000000-0000-4000-8000-000000000032',
    '10000000-0000-4000-8000-000000000024',
    'Speed bingo: only one row of three numbers each. First player to cross out their entire row wins 0 Beerits; everyone else 2.',
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
