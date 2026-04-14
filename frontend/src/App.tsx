import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { GraduationCap, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { getContract, CONNECTED_NETWORK, CONNECTED_NETWORK_NAME } from './utils/contract';
import ConnectWallet from './components/ConnectWallet';
import IssueCertificate from './components/IssueCertificate';
import VerifyCertificate from './components/VerifyCertificate';
import BlockchainExplorer from './components/BlockchainExplorer';
import CertificateTable from './components/CertificateTable';
const FALLBACK_RPC_URL = import.meta.env.VITE_RPC_URL || '';
const CERTIFICATE_CACHE_KEY = 'verichain:certificates';

type CertificateRecord = {
  studentName: string;
  course: string;
  institution: string;
  issueDate: number;
  certHash: string;
  issuedBy: string;
  isValid: boolean;
};

const readCertificateCache = (): CertificateRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CERTIFICATE_CACHE_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeCertificateCache = (records: CertificateRecord[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CERTIFICATE_CACHE_KEY, JSON.stringify(records));
};

const upsertCertificateCache = (record: CertificateRecord) => {
  const current = readCertificateCache();
  const next = [record, ...current.filter((item) => item.certHash !== record.certHash)];
  writeCertificateCache(next);
};

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const internalNetwork = await _provider.getNetwork();
        
        await _provider.send("eth_requestAccounts", []);
        const signer = await _provider.getSigner();
        const address = await signer.getAddress();
        const _balance = await _provider.getBalance(address);

        setAccount(address);
        setBalance(ethers.formatEther(_balance).slice(0, 6));
        setNetwork(internalNetwork.name === 'unknown' ? CONNECTED_NETWORK_NAME : internalNetwork.name);
        setChainId(Number(internalNetwork.chainId));
        setProvider(_provider);

        // Fetch existing certificates (from events)
        fetchCertificates(_provider);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const fetchCertificates = async (_provider: any) => {
    try {
      const contract = getContract(_provider);
      // For local demo, we can use events or a session list
      // Real implementation would filter events: contract.queryFilter("CertificateIssued")
      const filter = contract.filters.CertificateIssued();
      const events = await contract.queryFilter(filter);
      
      const certList = await Promise.all(events.map(async (event: any) => {
        const hash = event.args[0];
        try {
          const data = await contract.checkCertificate(hash);
          return {
            studentName: data[0],
            course: data[1],
            institution: data[2],
            issueDate: data[3],
            certHash: hash,
            issuedBy: data[4],
            isValid: data[5]
          };
        } catch (err) {
          return null;
        }
      }));

      const cachedCertificates = readCertificateCache();
      const mergedCertificates = [
        ...certList.filter((certificate) => certificate !== null),
        ...cachedCertificates.filter(
          (cached) => !certList.some((certificate) => certificate?.certHash === cached.certHash)
        ),
      ];

      setCertificates(mergedCertificates);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    }
  };

  const issueCertificate = async (data: any) => {
    if (!provider || !account) return;
    setIsIssuing(true);
    try {
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const nonce = await provider.getTransactionCount(account, 'pending');
      
      const tx = await contract.issueCertificate(
        data.studentName,
        data.course,
        data.institution,
        data.issueDate,
        data.certHash,
        { nonce }
      );
      
      await tx.wait();
      upsertCertificateCache({
        studentName: data.studentName,
        course: data.course,
        institution: data.institution,
        issueDate: data.issueDate,
        certHash: data.certHash,
        issuedBy: account,
        isValid: true,
      });
      await fetchCertificates(provider);
      alert("Certificate issued successfully!");
    } catch (err: any) {
      console.error("Issuance failed:", err);
      alert("Transaction failed: " + (err.reason || err.message));
    } finally {
      setIsIssuing(false);
    }
  };

  const verifyCertificate = async (hash: string) => {
    if (!provider && !FALLBACK_RPC_URL) {
      throw new Error('No RPC provider configured. Set VITE_RPC_URL in frontend/.env to verify certificates.');
    }

    const _provider = provider || new ethers.JsonRpcProvider(FALLBACK_RPC_URL);
    const contract = getContract(_provider);
    try {
      const data = await contract.checkCertificate(hash);
      return {
        studentName: data[0],
        course: data[1],
        institution: data[2],
        issueDate: data[3],
        issuedBy: data[4],
        isValid: data[5]
      };
    } catch (err: any) {
      const cachedCertificates = readCertificateCache();
      const cached = cachedCertificates.find((certificate) => certificate.certHash.toLowerCase() === hash.toLowerCase());

      if (cached) {
        return cached;
      }

      throw err;
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', connectWallet);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const isWrongNetwork = chainId !== null && chainId !== CONNECTED_NETWORK;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/20">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                VeriChain Academics
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">V 1.0</span>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em]">Decentralized Certificate Protocol</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold bg-[#111114] border border-[#222226] px-4 py-2 rounded-xl">
            <LayoutGrid className="w-4 h-4 text-purple-500" />
            DASHBOARD ACCESS
          </div>
        </header>

        {/* Connection Status */}
        <ConnectWallet 
          account={account} 
          balance={balance} 
          network={network}
          chainId={chainId}
          onConnect={connectWallet}
          isWrongNetwork={isWrongNetwork}
          expectedNetworkName={CONNECTED_NETWORK_NAME}
          expectedChainId={CONNECTED_NETWORK}
        />

        {/* Blockchain Explorer */}
        <BlockchainExplorer provider={provider || new ethers.JsonRpcProvider(FALLBACK_RPC_URL || undefined)} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <section>
            <IssueCertificate onIssue={issueCertificate} isIssuing={isIssuing} />
          </section>
          <section>
            <VerifyCertificate onVerify={verifyCertificate} />
          </section>
        </div>

        {/* Table */}
        <section className="mb-12">
          <CertificateTable certificates={certificates} />
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-[#222226] text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <p className="text-sm text-gray-500">Secured by Ethereum Zero-Knowledge-ish Proofs</p>
          </div>
          <p className="text-xs text-gray-600">Built for Academic Integrity & Global Portability</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
