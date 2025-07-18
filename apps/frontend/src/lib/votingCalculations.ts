import BigNumber from 'bignumber.js';

const toBigNumber = (value: BigNumber | bigint | number): BigNumber => {
  return typeof value === 'number'
    ? BigNumber(value)
    : typeof value === 'bigint'
      ? BigNumber(value.toString(10))
      : value;
}

export const getProposalQuorumPercent = (
  upvotes: bigint,
  totalVotingPower: bigint,
): BigNumber => {
  return toBigNumber(upvotes).div(toBigNumber(totalVotingPower)).multipliedBy(100)
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

export const customSortComparator = <T extends Record<string, any>>(
  a: T,
  b: T,
  key: keyof T
): number => {
  let aValue: string | number = a[key];
  let bValue: string | number = b[key];

  if (key === 'votingPower' && typeof aValue === 'string' && typeof bValue === 'string') {
    aValue = parseVotingPower(aValue);
    bValue = parseVotingPower(bValue);
  }

  if (key === 'time' && typeof aValue === 'string' && typeof bValue === 'string') {
    aValue = new Date(aValue).getTime();
    bValue = new Date(bValue).getTime();
  }

  if (bValue < aValue) return 1;
  if (bValue > aValue) return -1;
  return 0;
};

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

