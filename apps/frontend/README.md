# Etherlink Governance Website

## Overview
A Next.js app for exploring and taking part in Etherlink governance on Tezos. It shows governance contracts, proposals and voting periods, and lets bakers vote and upvote from their wallet.

## Core Features
- **Governance Contracts**: Browse slow, fast and sequencer governance
- **Periods**: Current, past and future periods with proposals and voting stats
- **Voting**: Connect a wallet to submit proposals, upvote and vote
- **Voting Rights**: Claim voting rights and manage voting keys (delegation contract)
- **CLI Commands**: Copy the matching CLI command for votes and upvotes

## Technical Stack
- Next.js, TypeScript, Material-UI, MobX
- Octez.js for wallet connection and contract calls
- PostHog for analytics
- API routes in `src/pages/api/` read governance data straight from the indexer's MySQL database

## Key Pages
- **Home** (`/`): Overview of the governance contracts
- **Governance** (`/governance/[governance]`): Current, past and future periods for one governance type

## Setup & Usage
```sh
cp .env.sample .env     # mainnet (also .env.mainnet.sample, .env.shadownet.sample)
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Run production server
```

## Environment Variables
- `NEXT_PUBLIC_NETWORK_TYPE`: `mainnet` or `shadownet`
- `NEXT_PUBLIC_RPC_URL`: Tezos RPC node
- `NEXT_PUBLIC_TZKT_API_URL` / `NEXT_PUBLIC_TZKT_URL`: TzKT API and explorer links
- `NEXT_PUBLIC_VOTING_RIGHTS_DELEGATION_CONTRACT`: voting rights delegation contract
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`: PostHog analytics
- `NEXT_PUBLIC_DISPLAY_IN_TEZ`: show amounts in tez
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL database filled by the indexer

## Data Flow

```mermaid
flowchart LR
  subgraph browser["Browser"]
    ui["Components"]
    cs["ContractStore<br/>(MobX)"]
    ws["WalletStore<br/>(MobX)"]
  end
  subgraph server["Next.js API routes"]
    contracts["/api/contracts"]
    curp["/api/[governance]/currentPeriod"]
    pastp["/api/[governance]/pastPeriods"]
    votes["/api/votes"]
    upvotes["/api/upvotes"]
    dbc["lib/database.ts"]
  end
  db[("MySQL<br/>filled by indexer")]
  chain["Tezos governance contracts"]

  ui --> cs
  ui --> ws
  cs --> contracts & curp & pastp & votes & upvotes
  contracts & curp & pastp & votes & upvotes --> dbc
  dbc --> db
  ws -->|"Octez.js<br/>signed operations"| chain
```
