import React, { useState } from 'react';
import { FileUp, Send, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { calculateSHA256 } from '../utils/hashHelper';

interface IssueCertificateProps {
  onIssue: (data: any) => Promise<void>;
  isIssuing: boolean;
}

const IssueCertificate: React.FC<IssueCertificateProps> = ({ onIssue, isIssuing }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    course: '',
    institution: '',
    issueDate: new Date().toISOString().split('T')[0]
  });
  const [file, setFile] = useState<File | null>(null);
  const [certHash, setCertHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsHashing(true);
      try {
        const hash = await calculateSHA256(selectedFile);
        setCertHash(hash);
      } catch (err) {
        console.error("Hashing failed:", err);
      } finally {
        setIsHashing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certHash) return;
    
    await onIssue({
      ...formData,
      issueDate: Math.floor(new Date(formData.issueDate).getTime() / 1000),
      certHash
    });
  };

  return (
    <div className="bg-[#111114] border border-[#222226] rounded-2xl p-8 shadow-2xl h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <FileUp className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Issue Certificate</h2>
          <p className="text-gray-400 text-sm">Register a new tamper-proof certificate</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Student Name</label>
            <input
              type="text"
              required
              className="w-full bg-[#1a1a1f] border border-[#333338] focus:border-purple-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
              placeholder="e.g. John Doe"
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Course / Degree</label>
            <input
              type="text"
              required
              className="w-full bg-[#1a1a1f] border border-[#333338] focus:border-purple-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
              placeholder="e.g. B.Tech Computer Science"
              value={formData.course}
              onChange={(e) => setFormData({...formData, course: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Institution</label>
            <input
              type="text"
              required
              className="w-full bg-[#1a1a1f] border border-[#333338] focus:border-purple-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
              placeholder="e.g. Harvard University"
              value={formData.institution}
              onChange={(e) => setFormData({...formData, institution: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Issue Date</label>
            <input
              type="date"
              required
              className="w-full bg-[#1a1a1f] border border-[#333338] focus:border-purple-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
              value={formData.issueDate}
              onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Upload Certificate PDF</label>
          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              required
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${file ? 'border-purple-500/50 bg-purple-500/5' : 'border-[#333338] bg-[#1a1a1f] group-hover:border-purple-500/30'}`}>
              {file ? (
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <FileUp className="w-8 h-8 text-gray-500 mb-2 group-hover:text-purple-400 transition-colors" />
                  <p className="text-gray-400">Drop PDF here or click to browse</p>
                </>
              )}
            </div>
          </div>
        </div>

        {isHashing && (
          <div className="flex items-center gap-2 text-purple-400 text-sm animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Computing cryptographic hash...
          </div>
        )}

        {certHash && !isHashing && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3 overflow-hidden">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-green-400 text-xs uppercase font-bold tracking-wider">SHA-256 Hash Generated</p>
              <p className="text-gray-300 text-xs truncate font-mono">{certHash}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!certHash || isIssuing || isHashing}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
        >
          {isIssuing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isIssuing ? 'Waiting for Transaction...' : 'Issue to Blockchain'}
        </button>
      </form>
    </div>
  );
};

export default IssueCertificate;
