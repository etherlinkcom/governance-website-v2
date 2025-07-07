import { useState } from 'react';

type Order = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: Order;
}

export function useTableSort<T>(
  data: T[],
  defaultKey: keyof T,
  customSort?: (a: T, b: T, key: keyof T) => number
) {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(defaultKey);

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = data.slice().sort((a, b) => {
    if (customSort) {
      const result = customSort(a, b, orderBy);
      return order === 'asc' ? result : -result;
    }

    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (bValue < aValue) {
      return order === 'asc' ? 1 : -1;
    }
    if (bValue > aValue) {
      return order === 'asc' ? -1 : 1;
    }
    return 0;
  });

  return {
    sortedData,
    order,
    orderBy,
    handleRequestSort
  };
}