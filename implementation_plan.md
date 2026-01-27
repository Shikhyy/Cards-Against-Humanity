# Improve Card Handling and Randomization

The user wants to ensure all cards are uploaded (loaded into the game) and that they don’t repeat often.
Currently, `server/cards.js` contains a small subset of cards. A PDF source (`downloaded_cards.pdf`) is available, and `server/extract_pdf.js` exists to parse it.

## User Review Required
> [!NOTE]
> This will overwrite `server/cards.js` with the full content extracted from the PDF.

## Proposed Changes

### Server
#### [MODIFY] [server.js](file:///Users/shikhar/Cards%20against%20humanity/server/server.js)
- Add a log on startup to print the number of White and Black cards loaded.
- (Optional) Verify shuffle and deck reset logic (current Fisher-Yates is standard and correct).

#### [NEW] [fetch_cards.js](file:///Users/shikhar/Cards%20against%20humanity/server/fetch_cards.js)
- Script to fetch card data from `https://raw.githubusercontent.com/crhallberg/json-against-humanity/master/cah-all-compact.json`.
- Parses the JSON.
- Writes to `cards.js` with `WHITE_CARDS` and `BLACK_CARDS` exports.

#### [EXECUTE] Run Fetch Script
- Run `node fetch_cards.js` in the `server` directory.
- Verify output structure (especially black cards having `pick` property).


## Verification Plan

### Automated Tests
- Run `node extract_pdf.js` and check the console output for the number of extracted cards.
- Check the file size and line count of `server/cards.js`.

### Manual Verification
1.  **Start Server**: Run `node server.js`.
2.  **Check Logs**: Confirm the server prints the new higher card counts.
3.  **Gameplay**: Start a game and verify cards are drawn correctly and new cards appear.
