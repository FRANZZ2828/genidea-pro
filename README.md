# GENIDEA PRO

React + Vite short-drama streaming interface, rebranded with a dark navy and electric-blue theme.

## Run locally
1. Install Node.js (LTS).
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local address shown by Vite.

## Included prototype features
- Rebranded GENIDEA PRO interface.
- Dark navy / electric-blue styling.
- Coin balance in the navigation bar.
- Demo coin packages (local browser storage only).
- Locked episode prompt with coin-unlock option.
- Demo ad-reward unlock option.

## Important production notes
The coin wallet and unlock records are currently stored in `localStorage`. This is only a front-end prototype and is not secure for real balances or payments. Before launch, implement authenticated user accounts, server-side balance transactions, payment verification/webhooks, and server-side episode authorization. The ad reward button is explicitly a demo placeholder; connect a legitimate ad provider and validate its reward callback on your backend. Never trust coin balances supplied by the browser.

This project uses the drama data API configured in `src/api/dramaApi.ts`. Confirm that you have permission to use the API and its video content before publishing.
