import { useState } from 'react';

type Order = 'asc' | 'desc';

export function useTableSort<T>(
  data: T[],
  defaultKey: keyof T
) {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultKey);

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const parseVotingPower = (value: string): number => {
    const num = parseFloat(value);
    const multiplier = value.includes('T') ? 1e12 :
                      value.includes('B') ? 1e9 : 1;
    return num * multiplier;
  };

  const sortedData = data.slice().sort((a, b) => {
    let aValue: any = a[orderBy];
    let bValue: any = b[orderBy];

    if (orderBy === 'voting_power' && typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = parseVotingPower(aValue);
      bValue = parseVotingPower(bValue);
    }

    if (orderBy === 'time' && typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc'
        ? aValue.localeCompare(bValue, undefined, { sensitivity: 'base', numeric: true })
        : bValue.localeCompare(aValue, undefined, { sensitivity: 'base', numeric: true });
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return { sortedData, order, orderBy, handleRequestSort };
}