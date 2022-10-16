import {getDefaultProvider} from 'ethers';

const provider = getDefaultProvider();

// Util to lookup ENS name
export const getENS = async (address: string): Promise<string | null> => {
  return provider.lookupAddress(address);
};
