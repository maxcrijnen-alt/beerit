-- Beginner-friendly guides for Rapid Fire Timer, Bomb Mode, and Game Night Activities.
-- Rewrites the single-paragraph `rules` into Setup / How to play / Scoring
-- sections so the game detail screen renders them as scannable blocks.
-- No schema changes; no card or scoring mechanics are altered.

update public.games
set rules =
'Setup
No equipment needed. The app timer runs on the same phone everyone is sharing.

How to play
Each card shows a category. Go around the group — each player names one answer that fits the category before the timer runs out. Answers must be new; no repeats allowed. The first player who hesitates, repeats an answer, or runs out of time on their turn receives 1 Beerit. The host taps that player to score and move to the next card. Players may skip prompts they find uncomfortable.

Scoring
The player who fails each round receives 1 Beerit. Fewest Beerits at the end wins. Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000017';

update public.games
set rules =
'Setup
Sit or stand in a circle. The host starts the round on the shared phone, then passes it into the circle.

How to play
Keep the phone moving around the circle while calling out answers in the category shown on the card. Each player says one new answer and immediately passes the phone along. No repeats. A hidden random timer is running — when it ends, the player holding the phone loses the round. The host taps that player to add 1 Beerit and move to the next card. Players may skip prompts they find uncomfortable.

Scoring
The player holding the phone when time runs out receives 1 Beerit per round. Fewest Beerits at the end wins. Beerits are fictional in-game penalty points with no real-world value — no wagers, no payouts, no settlement.'
where id = '10000000-0000-4000-8000-000000000090';

update public.games
set rules =
'Setup
Agree before you start which game types your group has available — card games, board games, dice games, or any other offline activity. Only check what you can actually play.

How to play
Each card tells the group which offline game to play and how to score it. Play that game, rank the players, and the host taps the result to score and advance. Skip any card for a game type you do not have available tonight.

Scoring
Each game type has its own Beerit rule shown on the card. Generally: 1st place 0 Beerits, 2nd place 1, 3rd place 2, and lower places 3. Beerits are fictional in-game penalty points with no real-world value.'
where id = '10000000-0000-4000-8000-000000000006';
