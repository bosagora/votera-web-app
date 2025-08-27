import {useCallback, useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {GasFeeEstimation} from 'votera-sdk-client';

/**
 * This hook returns the gas estimation for a particular transaction and
 * the price of the native token in USD
 *
 * NOTE: Due to what is assumed to be temporary design changes, this hook
 * does not yet poll for the gas fees on interval
 *
 * @param estimationFunction function that estimates gas fee
 * @param shouldPoll
 * @returns the average and maximum gas fee estimations, native token price
 * in USD, an error object if an error occurred while estimating,
 * and a function to stop the interval polling
 */
export const usePollGasFee = (
  estimationFunction: () => Promise<GasFeeEstimation | undefined>,
  shouldPoll = true
) => {
  const {network} = useNetwork();
  const [error, setError] = useState<Error | undefined>();
  const [maxFee, setMaxFee] = useState<BigInt | undefined>(BigInt(0));
  const [averageFee, setAverageFee] = useState<BigInt | undefined>(BigInt(0));
  const [tokenPrice, setTokenPrice] = useState<number>(0);

  // estimate gas for DAO creation
  useEffect(() => {
    async function getFees() {
      try {
        const estimation = await estimationFunction();
        setMaxFee(estimation?.max);
        setAverageFee(estimation?.average);
        setError(undefined);
      } catch (err) {
        setError(err as Error);
        setMaxFee(undefined);
        setAverageFee(undefined);
      }
    }
    if (shouldPoll) getFees();
  }, [estimationFunction, network, shouldPoll]);

  // stop polling in anticipation for polling at interval
  const stopPolling = useCallback(() => {
    setMaxFee(BigInt(0));
    setAverageFee(BigInt(0));
    setTokenPrice(0);
  }, []);
  return {error, tokenPrice, maxFee, averageFee, stopPolling};
};
