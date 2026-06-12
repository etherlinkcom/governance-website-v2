import { Contract } from "./types";

const mainnet_contracts: Contract[] = [
  {
    type: "slow",
    address: "KT1H5pCmFuhAwRExzNNrPQFKpunJx1yEVa6J",
  },
  {
    type: "fast",
    address: "KT1N5MHQW5fkqXkW9GPjRYfn5KwbuYrvsY1g",
  },
  {
    type: "sequencer",
    address: "KT1NcZQ3y9Wv32BGiUfD2ZciSUz9cY1DBDGF",
  },
  // Level 7692289 contracts
  {
    type: "slow",
    address: "KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK",
  },
  {
    type: "fast",
    address: "KT1GRAN26ni19mgd6xpL6tsH52LNnhKSQzP2",
  },
  {
    type: "sequencer",
    address: "KT1UvCsnXpLAssgeJmrbQ6qr3eFkYXxsTG9U",
  },
  // Level 8767489 4.0
  {
    type: "slow",
    address: "KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh",
  },
  {
    type: "fast",
    address: "KT1D1fRgZVdjTj5sUZKcSTPPnuR7LRxVYnDL",
  },
  {
    type: "sequencer",
    address: "KT1NnH9DCAoY1pfPNvb9cw9XPKQnHAFYFHXa",
  },
  // Level 8767489 4.1
  {
    address: "KT1VZVNCNnhUp7s15d9RsdycP7C1iwYhAQ8r",
    type: "slow",
    active: false
  },
  {
    address: "KT1DxndcFitAbxLdJCN3C1pPivqbC3RJxD1R",
    type: "fast",
    active: false
  },
  {
    address: "KT1WckZ2uiLfHCfQyNp1mtqeRcC1X6Jg2Qzf",
    type: "sequencer",
    active: false
  },
  // 6.3
  {
    address: "KT19oUVQPnVLuUBYXrBVd46WJnNAMpqkKSwo",
    type: "fast",
    active: true
  },
  {
    address: "KT1AXRU3wLc87WNhLhVGrgqDGubLACUMUgPb",
    type: "slow",
    active: true
  },
  {
    address: "KT1VGyd2cRSHoDnxDnSuqGJD3mL8DzcVqX98",
    type: "sequencer",
    active: false
  },
  // 6.4
  {
    address: "KT1DkQFmACvsUtnx8B4jirnp2CRi1cWSiELw",
    type: "sequencer",
    active: true
  }

];

const testnet_contracts: Contract[] = [
  {
    type: 'fast',
    address: "KT1EPbfihVUipo8rj5jnEyTpPuiwDn13RQ3M",
    active: true,
  },
  {
    type: 'sequencer',
    address: 'KT1HzGkbYdrF9NEVMP2jFo7L6wM9tLpUi2jd',
    active: true,
  }
]

export const all_contracts = process.env.NETWORK === "mainnet" ? mainnet_contracts : testnet_contracts;
