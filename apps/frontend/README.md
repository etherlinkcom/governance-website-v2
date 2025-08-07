# Etherlink Governance Website

## Overview
A Next.js application providing a user-friendly interface for exploring Tezos governance contracts, proposals, and voting periods. Built with TypeScript and Material-UI for responsive, real-time governance participation.

## Core Features
- **Contract Explorer**: Browse different governance contracts (Lambda DAO, Sequencer) with real-time blockchain data
- **Proposal Tracking**: View governance proposals with voting statistics and historical data
- **Period Management**: Track governance periods with proposal counts and voting power metrics
- **Smart Sorting**: Performance-optimized table operations with cached parsing

## Technical Stack
- **Frontend**: Next.js 14, TypeScript, Material-UI, MobX state management
- **Performance**: Bundle splitting, lazy loading, skeleton components to prevent layout shifts
- **Architecture**: Monorepo with shared types, responsive design, RESTful API integration

## Key Pages
- **Home**: Overview of available governance contracts
- **Contract View**: Detailed contract information with periods and proposals
- **Proposal Details**: Individual proposal voting data and statistics