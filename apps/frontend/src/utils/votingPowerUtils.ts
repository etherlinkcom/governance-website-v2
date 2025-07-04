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