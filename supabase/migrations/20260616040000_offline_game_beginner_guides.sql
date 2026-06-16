-- Beginner-friendly guides for the original offline games.
-- Content-only: rewrites the in-app `rules` text into scannable
-- Setup / How to play / Scoring sections (the game detail screen renders
-- `rules` with whitespace-pre-wrap, so blank lines become real breaks).
-- Mechanics and scoring are unchanged; `rules_url`, titles, and all other
-- columns are left untouched. Beerits stay fictional in-game penalty points.

update public.games
set rules =
'Setup
Use a standard deck without jokers. Deal all the cards out clockwise; it is fine if some players end up with one extra.

How to play
The starting player puts down one or more cards of the same value. Going clockwise, each player plays the same number of cards at a higher value or passes. A 2 is the highest card. When everyone passes, the last player to play clears the pile and leads again. The first player to empty their hand is the President.

Scoring
1st place 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3, and the last player out 5.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000007';

update public.games
set rules =
'Setup
Use a standard deck. Deal seven cards to each player and turn one card face up beside the draw pile. Agree which special cards you will use before you start.

How to play
On your turn, play a card matching the face-up card''s suit or value, or draw one card if you cannot or do not want to play. Recommended special cards: a 2 makes the next player draw two, an 8 skips the next player, and a jack lets you change the suit. Keep going until a player empties their hand.

Scoring
First player out 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3, and the last player 4.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000008';

update public.games
set rules =
'Setup
Play with an even number of players in teams of two. Partners sit opposite each other and secretly agree on a subtle signal. Deal four cards to each player and place four cards face up in the middle.

How to play
Everyone may swap one card at a time with the middle, as fast or slow as they like. Refresh the four middle cards when nobody wants them. When you hold four of a kind, signal your partner so they can call "Kemps". Play best of three rounds.

Scoring
Winning team members 0 Beerits, losing team members 3. A false Kemps call adds 1 extra Beerit to each member of that team.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000009';

update public.games
set rules =
'Setup
Use the 32 cards from 7 up to ace. Deal four cards to each player.

How to play
The player left of the dealer leads, and the others follow suit when they can. Card order from high to low is 10, 9, 8, 7, ace, king, queen, jack. Only the fourth and final trick decides the round. Before that final trick a player may "knock": anyone who folds takes the current penalty, while those who play on risk 1 extra Beerit.

Scoring
Each losing player normally takes 1 Beerit. Stop the game when someone reaches 7 Beerits.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000010';

update public.games
set rules =
'Setup
Set up a normal chess board. A five-minute-per-player timer keeps the round short, but it is optional.

How to play
Play one short game using standard chess rules.

Scoring
Winner 0 Beerits, loser 5, or 1 each after a draw.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000011';

update public.games
set rules =
'Setup
Set up a standard checkers board.

How to play
Play one game. You win by capturing all of your opponent''s pieces or by leaving them with no legal move.

Scoring
Winner 0 Beerits, loser 4, or 1 each after an agreed time-limit draw.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000012';

update public.games
set rules =
'Setup
Use a four-in-a-row set placed where both players can reach it.

How to play
Play short one-on-one rounds, alternating who drops first. The first player to connect four pieces in a row horizontally, vertically, or diagonally wins the round. Rotate opponents until everyone has played at least twice, then rank by wins and break ties by fewest losses.

Scoring
1st place 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000013';

update public.games
set rules =
'Setup
Use one six-sided die.

How to play
On your turn, roll as many times as you like, adding each result to your turn total. Bank that total whenever you choose. If you roll a 1, your turn ends and you score nothing that turn. The first player to reach 50 points wins; keep playing until the lower places are clear.

Scoring
1st place 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000014';

update public.games
set rules =
'Setup
Use five six-sided dice. Each player gets up to three rolls per turn.

How to play
Collect a 6 for the ship, then a 5 for the captain, then a 4 for the crew, in that order. Reroll any dice you have not set aside. Once you have all three, the last two dice are your cargo score. After three rounds each, rank players by total cargo.

Scoring
1st place 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000015';

update public.games
set rules =
'Setup
Use at least one six-sided die. Pass a single die around the group if that is all you have.

How to play
Each player rolls once per round. Record the result and repeat for five rounds. Rank players by their five-roll total; tied players roll again until the tie breaks.

Scoring
1st place 0 Beerits, 2nd place 1, 3rd place 2, every lower place 3.

Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000016';
