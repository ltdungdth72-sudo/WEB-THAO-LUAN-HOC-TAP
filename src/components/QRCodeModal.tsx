import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classNameTitle: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, classNameTitle }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Error generating QR', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-slate-900 relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Mã QR Tham Gia Thảo Luận</h3>
          <p className="text-sm text-slate-500 mt-1">
            Lớp: <span className="font-semibold text-slate-800">{classNameTitle}</span> – THPT Đinh Tiên Hoàng
          </p>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-200/80 mb-5">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Mã QR tham gia lớp học" className="w-56 h-56 rounded-lg shadow-sm" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">Đang tạo mã QR...</div>
          )}
          <p className="text-xs text-slate-500 mt-3 text-center">
            Học sinh mở camera hoặc Zalo trên điện thoại để quét mã và làm bài ngay
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-xl text-xs font-mono text-slate-700 truncate border border-slate-200">
            <span className="truncate flex-1 font-sans">{currentUrl}</span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-800 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shrink-0 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`${currentUrl}?view=student`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở tab học sinh thử nghiệm</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
