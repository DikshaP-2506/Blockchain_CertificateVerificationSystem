import React from 'react';
import { Wallet, ShieldCheck, AlertCircle } from 'lucide-react';
import { truncateAddress } from '../utils/hashHelper';

interface ConnectWalletProps {
  account: string | null;
  balance: string | null;
  network: string | null;
  chainId: number | null;
  onConnect: () => void;
  isWrongNetwork: boolean;
  expectedNetworkName: string;
  expectedChainId: number;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ 
  account, 
  balance, 
  network, 
  onConnect,
  isWrongNetwork,
  expectedNetworkName,
  expectedChainId,
}) => {
  return (
    <div className="bg-[#111114] border border-[#222226] rounded-2xl p-6 mb-8 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ethereum Wallet</h2>
            <p className="text-gray-400 text-sm">Connect via MetaMask to interact</p>
          </div>
        </div>

        {account ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-2 bg-[#1a1a1f] border border-[#333338] rounded-xl">
              <span className="text-gray-400 text-xs block uppercase tracking-wider mb-1">Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-white font-medium">{truncateAddress(account)}</span>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-[#1a1a1f] border border-[#333338] rounded-xl">
              <span className="text-gray-400 text-xs block uppercase tracking-wider mb-1">Balance</span>
              <span className="text-white font-medium">{balance} ETH</span>
            </div>

            <div className={`px-4 py-2 border rounded-xl ${isWrongNetwork ? 'bg-red-500/10 border-red-500/50' : 'bg-blue-500/10 border-blue-500/50'}`}>
              <span className="text-gray-400 text-xs block uppercase tracking-wider mb-1">Network</span>
              <div className="flex items-center gap-2">
                {isWrongNetwork ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                )}
                <span className={`font-medium ${isWrongNetwork ? 'text-red-400' : 'text-blue-400'}`}>
                  {network || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect MetaMask
          </button>
        )}
      </div>

      {isWrongNetwork && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-400 text-sm">
            Please switch to <strong>{expectedNetworkName} (Chain ID: {expectedChainId})</strong> in MetaMask.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
