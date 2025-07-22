import { Contract } from "./types";

export const past_contracts: Contract[] = [
  // Level 5316609 contracts
//   {
//     type: "slow",
//     address: "KT1H5pCmFuhAwRExzNNrPQFKpunJx1yEVa6J",
//   },
//   {
//     type: "fast",
//     address: "KT1N5MHQW5fkqXkW9GPjRYfn5KwbuYrvsY1g",
//   },
//   {
//     type: "sequencer",
//     address: "KT1NcZQ3y9Wv32BGiUfD2ZciSUz9cY1DBDGF",
//   },
//   // Level 7692289 contracts
//   {
//     type: "slow",
//     address: "KT1FPG4NApqTJjwvmhWvqA14m5PJxu9qgpBK",
//   },
//   {
//     type: "fast",
//     address: "KT1GRAN26ni19mgd6xpL6tsH52LNnhKSQzP2",
//   },
//   {
//     type: "sequencer",
//     address: "KT1UvCsnXpLAssgeJmrbQ6qr3eFkYXxsTG9U",
//   },
//   // Level 8767489 4.0
//   {
//     type: "slow",
//     address: "KT1XdSAYGXrUDE1U5GNqUKKscLWrMhzyjNeh",
//   },
//   {
//     type: "fast",
//     address: "KT1D1fRgZVdjTj5sUZKcSTPPnuR7LRxVYnDL",
//   },
//   {
//     type: "sequencer",
//     address: "KT1NnH9DCAoY1pfPNvb9cw9XPKQnHAFYFHXa",
//   },
];

export const latest_contracts: Contract[] = [
  // Level 8767489 4.1
//   {
//     address: "KT1VZVNCNnhUp7s15d9RsdycP7C1iwYhAQ8r",
//     type: "slow",
//     active: true,
//   },
//   {
//     address: "KT1DxndcFitAbxLdJCN3C1pPivqbC3RJxD1R",
//     type: "fast",
//     active: true
//   },
  {
    address: "KT1WckZ2uiLfHCfQyNp1mtqeRcC1X6Jg2Qzf",
    type: "sequencer",
    active: true
  },
];

export const all_contracts: Contract[] = [
  ...past_contracts,
  ...latest_contracts,
];
