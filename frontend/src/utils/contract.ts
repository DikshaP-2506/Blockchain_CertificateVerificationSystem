import { ethers } from 'ethers';
import contractData from './contractData.json';

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(contractData.address, contractData.abi, signerOrProvider);
};

export const CONNECTED_NETWORK = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
export const CONNECTED_NETWORK_NAME = import.meta.env.VITE_CHAIN_NAME || 'Sepolia';
