const { WHITE_CARDS } = require('./cards');

function getSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

    // Simple Jaccard-like token overlap
    const t1 = new Set(s1.split(''));
    const t2 = new Set(s2.split(''));
    const intersection = new Set([...t1].filter(x => t2.has(x)));
    const union = new Set([...t1, ...t2]);
    return intersection.size / union.size;
}

const similarPairs = [];
for (let i = 0; i < WHITE_CARDS.length; i++) {
    for (let j = i + 1; j < WHITE_CARDS.length; j++) {
        const c1 = WHITE_CARDS[i];
        const c2 = WHITE_CARDS[j];

        // Exact match already checked. Check Levenshtein or token overlap?
        // Let's just check if first 10 chars match or something simple first.
        if (c1.substring(0, 15) === c2.substring(0, 15)) {
            similarPairs.push([c1, c2]);
        }
    }
}

console.log(`Found ${similarPairs.length} potentially similar pairs (prefix match).`);
similarPairs.slice(0, 20).forEach(pair => console.log(pair));
