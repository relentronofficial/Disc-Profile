const fs = require('fs');

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function shuffleOptions(options) {
    const keys = ["A", "B", "C", "D"];
    // Get the current entries: [{ letter: "A", val: { text: "...", disc: "D" } }, ...]
    const entries = keys.map(k => options[k]);
    const shuffledEntries = shuffleArray(entries);
    
    const newOptions = {};
    keys.forEach((letter, index) => {
        newOptions[letter] = shuffledEntries[index];
    });
    return newOptions;
}

const filePath = 'src/lib/constants.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find and parse Question objects
// This is a bit complex for a regex, so I'll do a simple string replacement approach
// for each question block.

const questionsMatch = content.match(/export const QUESTIONS: Question\[\] = \[([\s\S]*?)\];/);
const employeeQuestionsMatch = content.match(/export const EMPLOYEE_QUESTIONS: Question\[\] = \[([\s\S]*?)\];/);

if (questionsMatch) {
    let questionsText = questionsMatch[1];
    // This is hard to parse safely with regex, so I'll use a hack:
    // Convert the text to valid JSON by adding quotes and removing trailing commas, 
    // but that's risky.
    // Instead, I'll use a script to evaluate the JS if possible, or just surgical regex.
}

// Actually, I have the data in my context from previous turns.
// I will just generate the FULL constants.ts content with a script and write it.
// I'll re-read the start and end of constants.ts to be sure.
