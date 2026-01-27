// Helper to test RNG quality
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const deckSize = 1200;
const iterations = 1000;
const positionSums = new Array(deckSize).fill(0);

// Run 1000 shuffles
for (let i = 0; i < iterations; i++) {
    const deck = Array.from({ length: deckSize }, (_, k) => k);
    shuffle(deck);
    deck.forEach((card, pos) => {
        positionSums[card] += pos;
    });
}

// Average position of each card should be approx deckSize / 2
const avgPos = positionSums.map(sum => sum / iterations);
const overallAvg = avgPos.reduce((a, b) => a + b) / deckSize;

console.log(`Expected Avg Position: ${deckSize / 2}`);
console.log(`Actual Avg Position: ${overallAvg}`);
console.log(`Min Avg Position: ${Math.min(...avgPos)}`);
console.log(`Max Avg Position: ${Math.max(...avgPos)}`);

// Check if any card is biased
const biasThreshold = 50;
const biasedCards = avgPos.filter(p => Math.abs(p - (deckSize / 2)) > biasThreshold);
console.log(`Cards with significant bias (> ${biasThreshold} deviation): ${biasedCards.length}`);
