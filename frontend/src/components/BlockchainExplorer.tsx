import React, { useEffect, useState, useRef } from 'react';
import { Blocks, Hash, Clock, Cpu, ArrowRight, Zap } from 'lucide-react';
import { truncateAddress } from '../utils/hashHelper';

interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number;
  transactions: string[];
  gasUsed: string;
  miner: string;
}

const BlockchainExplorer: React.FC<{ provider: any }> = ({ provider }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLatestBlocks = async () => {
    if (!provider) return;
    try {
      const latestBlockNumber = await provider.getBlockNumber();
      const blockPromises = [];
      // Fetch last 5 blocks
      for (let i = 0; i < 5; i++) {
        if (latestBlockNumber - i >= 0) {
          blockPromises.push(provider.getBlock(latestBlockNumber - i));
        }
      }
      
      const fetchedBlocks = await Promise.all(blockPromises);
      const formattedBlocks = fetchedBlocks.map(b => ({
        number: b.number,
        hash: b.hash,
        parentHash: b.parentHash,
        timestamp: b.timestamp,
        transactions: b.transactions,
        gasUsed: b.gasUsed?.toString() || '0',
        miner: b.miner
      }));
      setBlocks(formattedBlocks);
    } catch (err) {
      console.error("Error fetching blocks:", err);
    }
  };

  useEffect(() => {
    fetchLatestBlocks();
    const interval = setInterval(fetchLatestBlocks, 5000);
    return () => clearInterval(interval);
  }, [provider]);

  return (
    <div className="bg-[#0f0f12] border border-[#222226] rounded-2xl p-6 mb-8 overflow-hidden shadow-2xl relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Blocks className="w-64 h-64 text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Blocks className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Blockchain Explorer</h2>
            <p className="text-gray-400 text-sm">Real-time block stream</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
          <Zap className="w-3 h-3 animate-pulse" />
          LIVE NETWORK
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x relative z-10"
      >
        {blocks.map((block, index) => (
          <div 
            key={block.hash}
            className="flex-none w-80 bg-[#16161a] border border-[#222226] hover:border-blue-500/30 rounded-2xl p-5 transition-all group snap-center"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-400 font-bold font-mono text-lg">#{block.number}</span>
              <div className="p-2 bg-[#1a1a1f] rounded-lg">
                <Hash className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Block Hash</p>
                <p className="text-white text-xs font-mono truncate">{block.hash}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Timestamp</p>
                  <div className="flex items-center gap-1.5 text-white">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs">{new Date(block.timestamp * 1000).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Txs</p>
                  <div className="flex items-center gap-1.5 text-white">
                    <Cpu className="w-3 h-3 text-gray-400" />
                    <span className="text-xs">{block.transactions.length} Transactions</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#222226] mt-4 flex items-center justify-between">
                <div className="text-[10px] text-gray-500">
                  Parent: <span className="font-mono">{truncateAddress(block.parentHash)}</span>
                </div>
                {index < blocks.length - 1 && (
                   <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainExplorer;
