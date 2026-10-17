import React from 'react';
import { X, Sliders, RotateCcw, Info, Check, Sparkles } from 'lucide-react';
import { DetectionSettings } from '../types';
import { DEFAULT_DETECTION_SETTINGS } from '../utils/colorDetector';

interface SettingsModalProps {
  isOpen: boolean;
  settings: DetectionSettings;
  onSave: (newSettings: DetectionSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = React.useState<DetectionSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleReset = () => {
    setLocalSettings(DEFAULT_DETECTION_SETTINGS);
  };

  const handleApply = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Pengaturan Deteksi Warna</h3>
              <p className="text-xs text-slate-400">
                Kalibrasi algoritma analisis piksel untuk mesin fotokopi Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Setting 1: Sensitivitas Warna (Delta RGB) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 block">
                  Sensitivitas Warna (Ambang Perbedaan RGB)
                </label>
                <p className="text-xs text-slate-500">
                  Perbedaan minimum antara kanal warna (|R-G|, |G-B|, |B-R|) untuk dianggap piksel
                  berwarna.
                </p>
              </div>
              <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs shrink-0">
                Δ {localSettings.colorDeltaThreshold}
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={localSettings.colorDeltaThreshold}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  colorDeltaThreshold: parseInt(e.target.value),
                })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>10 (Sangat Sensitif / Warna Pudar)</span>
              <span>Default: 22</span>
              <span>60 (Hanya Warna Sangat Pekat)</span>
            </div>
          </div>

          {/* Setting 2: Proporsi Minimum Piksel Berwarna */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 block">
                  Ambang Batas Proporsi Halaman (% Luas)
                </label>
                <p className="text-xs text-slate-500">
                  Persentase minimum luas halaman yang harus berwarna agar otomatis dikelompokkan ke
                  kategori Berwarna.
                </p>
              </div>
              <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs shrink-0">
                {localSettings.minColorProportion}%
              </span>
            </div>

            <input
              type="range"
              min="0.02"
              max="1.5"
              step="0.01"
              value={localSettings.minColorProportion}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  minColorProportion: parseFloat(e.target.value),
                })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>0.02% (Termasuk logo sangat kecil)</span>
              <span>Default: 0.08%</span>
              <span>1.5% (Hanya blok warna besar)</span>
            </div>
          </div>

          {/* Setting 3: Toleransi Kertas Scan / Noise Kuning */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-slate-900 block">
                  Toleransi Noise & Kertas Scan Kuning
                </label>
                <p className="text-xs text-slate-500">
                  Mengabaikan bias warna kertas tua / hasil scan scanner fotokopi yang agak
                  kekuningan.
                </p>
              </div>
              <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs shrink-0">
                {localSettings.noiseTolerance}
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="35"
              step="1"
              value={localSettings.noiseTolerance}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  noiseTolerance: parseInt(e.target.value),
                })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>5 (Ketat)</span>
              <span>Default: 18 (Optimal Kertas Fotokopi)</span>
              <span>35 (Abaikan Warna Samar)</span>
            </div>
          </div>

          {/* Practical Note Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Panduan Kalibrasi untuk Operator Fotokopi:</span>
            </div>
            <p>
              • Nilai standar dirancang untuk menyeimbangkan antara deteksi logo stempel resmi
              berwarna kecil dan pencegahan salah deteksi pada dokumen scan buram/kotor.
            </p>
            <p>
              • Jika pelanggan membawa dokumen hasil scan kertas koran/buram tua yang terdeteksi
              warna, naikkan nilai <em>Toleransi Noise</em> ke 25-30.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Kembalikan Standar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Terapkan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
