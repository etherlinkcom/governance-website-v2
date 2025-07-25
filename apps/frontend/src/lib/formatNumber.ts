export const formatNumber = (num: number) => {
    const displayInTez = process.env.DISPLAY_IN_TEZ === 'true';
    const value = displayInTez ? num / 1_000_000 : num;
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value);
  };

