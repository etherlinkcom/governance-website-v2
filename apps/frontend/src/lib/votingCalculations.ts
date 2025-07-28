import BigNumber from 'bignumber.js';

const toBigNumber = (value: BigNumber | bigint | number): BigNumber => {
  return typeof value === 'number'
    ? BigNumber(value)
    : typeof value === 'bigint'
      ? BigNumber(value.toString(10))
      : value;
}

export const getProposalQuorumPercent = (
  upvotes?: bigint | number,
  totalVotingPower?: bigint | number,
): string => {
  if (!upvotes || !totalVotingPower || totalVotingPower === 0) {
    return BigNumber(0).toString();
  }
  return toBigNumber(upvotes)
          .div(toBigNumber(totalVotingPower))
          .multipliedBy(100)
          .decimalPlaces(2)
          .toString();
};

export const getPromotionQuorumPercent = (
  totalYea: bigint | number,
  totalNay: bigint | number,
  totalPass: bigint | number,
  totalVotingPower: bigint | number,
): BigNumber => {
  return toBigNumber(totalYea)
    .plus(toBigNumber(totalNay))
    .plus(toBigNumber(totalPass))
    .div(toBigNumber(totalVotingPower))
    .multipliedBy(100)
};

export const getPromotionSupermajorityPercent = (
  totalYea: bigint | number,
  totalNay: bigint | number
): BigNumber => {
  const totalYeaBN = toBigNumber(totalYea);
  const totalNayBN = toBigNumber(totalNay);

  if (totalYeaBN.isZero() && totalNayBN.isZero()) return BigNumber(0);

  return totalYeaBN.div(totalYeaBN.plus(totalNayBN)).multipliedBy(100)
};

export const getVotingPowerPercent = (
  votingPower: bigint,
  totalVotingPower: bigint
): BigNumber => {
  const votingPowerBN = toBigNumber(votingPower);
  const totalVotingPowerBN = toBigNumber(totalVotingPower);

  return votingPowerBN.multipliedBy(100).div(totalVotingPowerBN);
};


export const parseVotingPower = (value: string): number => {
  const num = parseFloat(value);
  const multiplier = value.includes('T') ? 1000000000000 :
                    value.includes('B') ? 1000000000 : 1;
  return num * multiplier;
};