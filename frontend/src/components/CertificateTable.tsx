import React from 'react';
import { Table, CheckCircle, XCircle, ExternalLink, Filter } from 'lucide-react';
import { truncateAddress } from '../utils/hashHelper';

interface Certificate {
  studentName: string;
  course: string;
  institution: string;
  issueDate: bigint;
  certHash: string;
  issuedBy: string;
  isValid: boolean;
}

interface CertificateTableProps {
  certificates: Certificate[];
}

const CertificateTable: React.FC<CertificateTableProps> = ({ certificates }) => {
  return (
    <div className="bg-[#111114] border border-[#222226] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-[#222226] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 rounded-xl">
            <Table className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Registry Database</h2>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-[#1a1a1f] px-4 py-2 rounded-lg border border-[#333338]">
          <Filter className="w-3 h-3" />
          FILTER RECORDS
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#16161a] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-[#222226]">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Course</th>
              <th className="px-6 py-4">Hash</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222226]">
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                  No certificates registered in the current session
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.certHash} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{cert.studentName}</p>
                    <p className="text-gray-500 text-xs">{cert.institution}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{cert.course}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-blue-400">{truncateAddress(cert.certHash)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {cert.isValid ? (
                      <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full w-fit border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-[10px] font-bold">VALID</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-full w-fit border border-red-500/20">
                        <XCircle className="w-3 h-3" />
                        <span className="text-[10px] font-bold">REVOKED</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 bg-[#1a1a1f] border border-[#333338] rounded-lg text-gray-400 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificateTable;
