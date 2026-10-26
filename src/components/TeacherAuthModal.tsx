import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle, ArrowRight } from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Vui lòng nhập mã PIN giáo viên');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/teacher/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(pin.trim());
        setPin('');
      } else {
        setError(data.error || 'Mã PIN không đúng. Vui lòng thử lại.');
      }
    } catch {
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 border border-slate-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Xác Thực Giáo Viên</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dành cho cô <span className="font-semibold text-slate-800">Lê Thị Dung</span> quản lý tiết học và trình chiếu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nhập mã PIN bảo mật
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Nhập mã PIN..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              Mã PIN mặc định: <span className="font-mono font-semibold text-slate-600">1010</span> (có thể đổi trong Cài đặt)
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            <span>{isLoading ? 'Đang xác thực...' : 'VÀO MÀN HÌNH GIÁO VIÊN'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
