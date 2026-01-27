const fs = require('fs');
const pdf = require('pdf-parse');

const PDF_PATH = '../CAH_PrintPlay2022-RegularInk-FINAL-outlined.pdf';

async function extractCards() {
    try {
        const dataBuffer = fs.readFileSync(PDF_PATH);
        const data = await pdf(dataBuffer);

        const fullText = data.text;
        console.log(`DEBUG: Total Pages: ${data.numpages}`);

        // Split by lines and clean up
        const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        console.log(`DEBUG: Found ${lines.length} non-empty lines.`);
        console.log("DEBUG: First 20 lines:", lines.slice(0, 20));


        const whiteCards = [];
        const blackCards = [];

        for (const line of lines) {
            // Basic Cleanup
            if (line.match(/Cards Against Humanity/i)) continue;
            if (line.match(/CAH/)) continue;
            if (line.match(/Page [0-9]/)) continue;
            if (line.length < 3) continue;

            // Black Card Heuristic
            const isBlack = (line.includes('_') || line.includes('?') || line.match(/PICK [0-9]/i));

            if (isBlack) {
                let pick = 1;
                if (line.match(/PICK 2/i)) pick = 2;
                if (line.match(/PICK 3/i)) pick = 3;

                let text = line.replace(/PICK [0-9]/i, '').trim();

                // Dedupe
                if (!blackCards.find(c => c.text === text)) {
                    blackCards.push({ text, pick });
                }
            } else {
                // White Card
                if (!whiteCards.includes(line)) {
                    whiteCards.push(line);
                }
            }
        }

        console.log(`Extracted ${whiteCards.length} White Cards and ${blackCards.length} Black Cards.`);

        // Generate valid JS content
        const fileContent = `const WHITE_CARDS = ${JSON.stringify(whiteCards, null, 2)};
const BLACK_CARDS = ${JSON.stringify(blackCards, null, 2)};
module.exports = { WHITE_CARDS, BLACK_CARDS };`;

        fs.writeFileSync('cards.js', fileContent);
        console.log('Successfully wrote cards.js');

    } catch (err) {
        console.error('Error parsing PDF:', err);
    }
}

extractCards();
