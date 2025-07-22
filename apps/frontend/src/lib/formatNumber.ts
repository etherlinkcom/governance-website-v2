export const formatNumber = (num: number) => {
    // TODO switch between mutez and tez
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(num);
  };

