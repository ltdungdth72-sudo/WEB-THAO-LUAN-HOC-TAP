import React, { useState } from 'react';
import { Lock, X, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (!cleanPin) {
      setError('Vui lòng nhập mã PIN giáo viên');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/teacher/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          onSuccess(cleanPin);
          setPin('');
          return;
        }
      }

      // If response is not ok or error
      const data = await res.json().catch(() => null);
      if (data?.error) {
        // If master recovery pin 1010 was entered, allow entry
        if (cleanPin === '1010') {
          onSuccess(cleanPin);
          setPin('');
          return;
        }
        setError(data.error);
      } else if (cleanPin === '1010') {
        onSuccess(cleanPin);
        setPin('');
      } else {
        setError('Mã PIN không đúng. Vui lòng nhập 1010.');
      }
    } catch {
      // Offline fallback: if network is down or proxy issue, allow 1010
      if (cleanPin === '1010') {
        onSuccess(cleanPin);
        setPin('');
      } else {
        setError('Không thể kết nối máy chủ. Vui lòng thử dùng mã mặc định 1010.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setPin('1010');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 border border-slate-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Nhập mã PIN bảo mật
              </label>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" /> Điền nhanh 1010
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                maxLength={10}
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Nhập mã PIN..."
                autoFocus
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-slate-500">
              <span>Mã PIN mặc định:</span>
              <button
                type="button"
                onClick={handleQuickFill}
                className="font-mono font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors"
              >
                1010
              </button>
            </div>
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
