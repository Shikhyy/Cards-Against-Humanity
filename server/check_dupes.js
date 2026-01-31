const { WHITE_CARDS, BLACK_CARDS } = require('./cards');

console.log(`Checking ${WHITE_CARDS.length} White Cards and ${BLACK_CARDS.length} Black Cards...`);

const whiteCounts = {};
let whiteDupes = 0;

WHITE_CARDS.forEach(card => {
    const text = card.trim();
    if (whiteCounts[text]) {
        whiteCounts[text]++;
        console.log(`[DUPLICATE WHITE]: "${text}" (Count: ${whiteCounts[text]})`);
        whiteDupes++;
    } else {
        whiteCounts[text] = 1;
    }
});

const blackCounts = {};
let blackDupes = 0;

BLACK_CARDS.forEach(card => {
    const text = card.text.trim();
    if (blackCounts[text]) {
        blackCounts[text]++;
        console.log(`[DUPLICATE BLACK]: "${text}" (Count: ${blackCounts[text]})`);
        blackDupes++;
    } else {
        blackCounts[text] = 1;
    }
});

console.log(`\n--- REPORT ---`);
console.log(`Total White Duplicates: ${whiteDupes}`);
console.log(`Total Black Duplicates: ${blackDupes}`);
if (whiteDupes === 0 && blackDupes === 0) {
    console.log("Clean! No duplicates found.");
} else {
    console.log("Duplicates found! Recommendation: De-duplicate the arrays in cards.js.");
}
