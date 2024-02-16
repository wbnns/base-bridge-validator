# base-bridge-validator

## Overview
![Alt](https://repobeats.axiom.co/api/embed/45100930be03bcb501e479efbebbe13aff805c55.svg "Repobeats analytics image")

This repo is for a GitHub Action that is designed to automate the validation process for pull requests (PRs) that modify the `apps/bridge/assets.ts` file in the `base-org/web` repository. Specifically, it checks for additions of `L2symbol` entries within pull requests. If a new `L2symbol` is added, the action validates it against a predefined token list in the `ethereum-optimism/ethereum-optimism.github.io` repository's `optimism.tokenlist.json` file.

The action ensures that any newly added `L2symbol` meets the following criteria:

- Exists within the `optimism.tokenlist.json` with a `chainId` of 8453.
- Has a `baseBridgeAddress` of `0x4200000000000000000000000000000000000010`.

If these conditions are met, the GitHub Action passes, indicating the PR is compliant with the specified validation rules. Otherwise, the action fails, signaling a required review or correction for the proposed changes.

## How It Works

1. **Trigger Conditions:** The action triggers on any pull request that includes modifications to `apps/bridge/assets.ts`.

2. **Validation Process:**

   - The action first checks if the pull request adds any new `L2symbol` entries to `assets.ts`.
   - If new `L2symbol` entries are found, it fetches the latest `optimism.tokenlist.json` from the external repository.
   - Each new `L2symbol` is then validated against the token list to ensure it matches the required `chainId` and `baseBridgeAddress`.

3. **Outcome:**
   - **Pass:** The PR does not add new `L2symbol` entries, or all added `L2symbol` entries meet the validation criteria.
   - **Fail:** At least one of the newly added `L2symbol` entries fails to meet the validation criteria.

## Implementation Details

- **Node.js Script:** The core logic is implemented in a Typescript (`validateBaseBridgeAddress.ts`). This script performs the extraction and validation of `L2symbol` entries.
- **GitHub Action Workflow:** Defined in `.github/workflows/validateBaseBridgeAddress.yml`, this workflow sets up the environment, runs the validation script, and determines the PR's pass/fail status based on the script's outcome.

## Requirements

- Typescript environment with Axios installed for HTTP requests (handled within the GitHub Action workflow).
- Access to the GitHub API for fetching file contents when necessary.

## Adding to Your Repository

To use this GitHub Action in your repository, follow these steps:

1. Place the `validateBaseBridgeAddress.ts` script in your repository.
2. Create the GitHub Action workflow file at `.github/workflows/validateBaseBridgeAddress.yml` with the provided configuration.
3. Adjust the workflow and script as necessary to fit your repository structure and validation rules.

## License

[MIT](LICENSE)
