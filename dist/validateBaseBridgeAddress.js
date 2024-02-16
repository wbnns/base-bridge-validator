"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execAsync = util_1.default.promisify(child_process_1.exec);
async function getModifiedSymbols() {
    try {
        const { stdout } = await execAsync("git diff HEAD~1 -- apps/bridge/assets.ts | grep '^+.*L2symbol:'");
        const addedLines = stdout.split("\n");
        const symbolRegex = /L2symbol:\s*['"]([^'"]+)['"]/;
        const symbols = addedLines
            .map((line) => {
            const match = line.match(symbolRegex);
            return match ? match[1] : null;
        })
            .filter((symbol) => symbol !== null);
        return symbols;
    }
    catch (err) {
        console.error("Error fetching modified symbols:", err);
        return [];
    }
}
async function validateL2symbol() {
    const symbols = await getModifiedSymbols();
    if (symbols.length === 0) {
        console.log("No new token added. Skipping validation.");
        return;
    }
    const tokenListUrl = "https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json";
    const response = await axios_1.default.get(tokenListUrl);
    const tokenList = response.data;
    let allSymbolsValid = true;
    for (const symbol of symbols) {
        const token = tokenList.tokens.find((token) => token.symbol === symbol &&
            token.chainId === 8453 &&
            token.baseBridgeAddress === "0x4200000000000000000000000000000000000010");
        if (!token) {
            console.error(`Validation failed for new token: ${symbol}`);
            allSymbolsValid = false;
            break;
        }
    }
    if (!allSymbolsValid) {
        console.log("Token(s) failed validation.");
        process.exit(1);
    }
    else {
        console.log("Token(s) validated successfully.");
    }
}
validateL2symbol().catch((err) => {
    console.error("Validation error:", err.message);
    process.exit(1);
});
