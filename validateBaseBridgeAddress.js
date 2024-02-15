const fs = require("fs");
const axios = require("axios");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

async function getModifiedSymbols() {
  // Execute a Git command to find added lines containing 'L2symbol' in assets.ts
  const { stdout, stderr } = await execAsync(
    "git diff HEAD~1 -- apps/bridge/assets.ts | grep '^+.*L2symbol:'"
  );
  if (stderr) {
    console.error("Error fetching modified symbols:", stderr);
    return [];
  }

  // Extract symbols from added lines
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

async function validateL2symbol() {
  const symbols = await getModifiedSymbols();

  // If no new L2symbols were added, exit successfully without further checks
  if (symbols.length === 0) {
    console.log("No new token added. Skipping validation.");
    return;
  }

  // Fetch the optimism.tokenlist.json file
  const tokenListUrl =
    "https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json";
  const response = await axios.get(tokenListUrl);
  const tokenList = response.data;

  // Validate each new extracted symbol
  let allSymbolsValid = true;
  for (const symbol of symbols) {
    const token = tokenList.tokens.find(
      (token) =>
        token.symbol === symbol &&
        token.chainId === 8453 &&
        token.baseBridgeAddress === "0x4200000000000000000000000000000000000010"
    );
    if (!token) {
      console.error(`Validation failed for new token: ${symbol}`);
      allSymbolsValid = false;
      break; // Exit the loop on the first failure
    }
  }

  if (!allSymbolsValid) {
    console.log("Token(s) failed validation.");
    process.exit(1); // Exit with error
  } else {
    console.log("Token(s) validated successfully.");
  }
}

validateL2symbol().catch((err) => {
  console.error("Validation error:", err.message);
  process.exit(1);
});
