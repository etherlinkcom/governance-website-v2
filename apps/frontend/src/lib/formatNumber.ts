import { BigNumber } from 'bignumber.js';

export const formatNumber = (num: number | BigNumber): string => {
    const displayInTez = process.env.NEXT_PUBLIC_DISPLAY_IN_TEZ === 'true';
    const value = Number(displayInTez ? (num instanceof BigNumber ? num.div(1_000_000) : num / 1_000_000) : num);
    return new Intl.NumberFormat(undefined, {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value);
  };

