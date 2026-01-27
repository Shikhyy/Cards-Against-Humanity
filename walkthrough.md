# Bot Functionality Walkthrough

## New Features
-   **Add Bots**: Hosts can now add bots to the lobby.
-   **Auto-Play**: Bots automatically play random cards from their hand.
-   **No Czar**: Bots are automatically skipped during the Czar rotation, ensuring a human always judges.

## How to Test
1.  **Create Room**: Open the app and create a new room.
2.  **Add Bots**: As the host, click the "ADD BOT" button in the lobby. You should see "Bot 1", "Bot 2", etc., appear in the player list.
3.  **Start Game**: Once you have at least 3 players (humans + bots), click "START GAME".
4.  **Observe**:
    -   Bots will play their cards instantly.
    -   You (the human) will likely be the first Czar.
    -   After you pick a winner, the next human player becomes Czar (or it rotates back to you if you are the only human).
