# Etherlink Governance Indexer

## Overview
A Node.js backend service that indexes Tezos governance data into MySQL. Provides Express API endpoints for database operations, real-time blockchain monitoring, and governance data synchronization.

## Core Features
- **Database Management**: MySQL migrations for governance data schema
- **Real-time Indexing**: WebSocket listener for live blockchain events via TzKT API
- **Express API**: RESTful endpoints for triggering indexing operations
- **Historical Data**: Full governance history indexing with incremental updates

## Technical Stack
- **Backend**: Node.js with TypeScript and Express
- **Database**: MySQL with automated migrations
- **Blockchain API**: TzKT integration for Tezos data
- **Architecture**: Monorepo with shared types, migration system

## Key Components
- **Migrations**: SQL schema management in `/src/db/migrations/`
- **API Routes**: Express endpoints for manual indexing operations
- **WebSocket Listener**: Real-time governance event processing
- **Contract Indexer**: Historical and incremental data synchronization

## API Endpoints
```sh
GET /start-listener      # Start real-time blockchain listener
GET /stop-listener       # Stop the listener
GET /index-active        # Index active governance contracts
GET /index-all          # Index all contracts (active + historical)
```

## Setup & Usage
```sh
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Run production server
```


The indexer ensures governance data is consistently available and up-to-date for the frontend application through both real-time monitoring and on