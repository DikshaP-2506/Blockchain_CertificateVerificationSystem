import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Loader2, FileSearch } from 'lucide-react';
import { calculateSHA256, formatDate } from '../utils/hashHelper';

interface VerifyCertificateProps {
  onVerify: (hash: string) => Promise<any>;
}

const VerifyCertificate: React.FC<VerifyCertificateProps> = ({ onVerify }) => {
  const [file, setFile] = useState<File | null>(null);
  const [manualHash, setManualHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsVerifying(true);
      setError(null);
      setResult(null);
      
      try {
        const hash = await calculateSHA256(selectedFile);
        const data = await onVerify(hash);
        setResult(data);
      } catch (err: any) {
        const message = String(err?.message || '');
        setError(
          message.includes('NotFound') || message.includes('certificate not found')
            ? 'Certificate is not present on the current network. If you are using a local chain, previously issued certificates may have been reset after a restart.'
            : err.message || 'Certificate not found or tampered.'
        );
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHash) return;
    setIsVerifying(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await onVerify(manualHash);
      setResult(data);
    } catch (err: any) {
      const message = String(err?.message || '');
      setError(
        message.includes('NotFound') || message.includes('certificate not found')
          ? 'Certificate is not present on the current network. If you are using a local chain, previously issued certificates may have been reset after a restart.'
          : err.message || "Certificate not found."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#111114] border border-[#222226] rounded-2xl p-8 shadow-2xl h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Search className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Verify Authenticity</h2>
          <p className="text-gray-400 text-sm">Check if a certificate is real and valid</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Option 1: Upload PDF File</label>
          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#333338] bg-[#1a1a1f] group-hover:border-emerald-500/30'}`}>
              <FileSearch className={`w-8 h-8 mb-2 transition-colors ${file ? 'text-emerald-400' : 'text-gray-500 group-hover:text-emerald-400'}`} />
              <p className="text-gray-400">Click to upload or drag & drop</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#222226]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111114] px-2 text-gray-500 font-bold tracking-widest">OR</span>
          </div>
        </div>

        <form onSubmit={handleManualSearch} className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Option 2: Enter Certificate Hash</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-[#1a1a1f] border border-[#333338] focus:border-emerald-500 rounded-xl px-4 py-3 text-white outline-none transition-colors font-mono text-sm"
              placeholder="0x..."
              value={manualHash}
              onChange={(e) => setManualHash(e.target.value)}
            />
            <button
              type="submit"
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {isVerifying && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <p className="text-emerald-400 animate-pulse">Querying Blockchain Registry...</p>
          </div>
        )}

        {result && (
          <div className={`mt-6 border-l-4 rounded-r-xl p-6 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4 ${result.isValid ? 'bg-emerald-500/5 border-emerald-500' : 'bg-red-500/5 border-red-500'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {result.isValid ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${result.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.isValid ? 'Verified Authentic' : 'Invalid Certificate'}
                  </h3>
                  <p className="text-gray-400 text-sm">Status: {result.isValid ? 'VALID' : 'REVOKED'}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${result.isValid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                {result.isValid ? 'Secure' : 'Warning'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Student</p>
                <p className="text-white font-medium">{result.studentName}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Course</p>
                <p className="text-white font-medium">{result.course}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Institution</p>
                <p className="text-white font-medium">{result.institution}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-1">Issue Date</p>
                <p className="text-white font-medium">{formatDate(result.issueDate)}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-center gap-4 animate-in shake">
            <ShieldAlert className="w-10 h-10 text-red-500 shrink-0" />
            <div>
              <h3 className="text-red-500 font-bold">Verification Failed</h3>
              <p className="text-red-400/80 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
