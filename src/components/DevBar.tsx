import React, { useState } from 'react';
import { Shield, User, UserX, Settings, Activity, RefreshCw } from 'lucide-react';

interface DevBarProps {
  simulationMode: 'firebase' | 'guest' | 'user' | 'admin';
  setSimulationMode: (mode: 'firebase' | 'guest' | 'user' | 'admin') => void;
  realUser: { email?: string; uid?: string } | null;
  realIsAdmin: boolean;
}

export const DevBar: React.FC<DevBarProps> = ({
  simulationMode,
  setSimulationMode,
  realUser,
  realIsAdmin,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-sm w-full font-sans">
      {/* Mini toggle handle */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 bg-zinc-900/95 text-white text-xs px-3 py-2 rounded-full shadow-lg border border-zinc-800 hover:bg-zinc-800 transition-all font-semibold"
        >
          <Settings className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Sandbox Mode: {simulationMode.toUpperCase()}</span>
        </button>
      ) : (
        <div className="bg-zinc-950/95 border border-zinc-800 text-zinc-200 rounded-xl shadow-2xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider uppercase text-zinc-400">Dev Sandbox Bar</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-zinc-500 hover:text-zinc-300 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800"
            >
              Minimize
            </button>
          </div>

          {/* Current Firebase Auth Status */}
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-lg p-2.5 mb-3 text-xs">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Real Firebase Auth State
            </div>
            {realUser ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate">{realUser.email}</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Role: {realIsAdmin ? 'Admin (Custom Claim)' : 'Regular User'}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                <span>Belum Login (Guest)</span>
              </div>
            )}
          </div>

          {/* Controller Mode */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Pilih Role Simulasi (Testing UI)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {/* Firebase Option */}
              <button
                onClick={() => setSimulationMode('firebase')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  simulationMode === 'firebase'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${simulationMode === 'firebase' ? 'animate-spin' : ''}`} />
                <span>Real Auth</span>
              </button>

              {/* Guest Option */}
              <button
                onClick={() => setSimulationMode('guest')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  simulationMode === 'guest'
                    ? 'bg-zinc-100 text-zinc-950 border-white shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Guest</span>
              </button>

              {/* Regular User Option */}
              <button
                onClick={() => setSimulationMode('user')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  simulationMode === 'user'
                    ? 'bg-[#154212] text-white border-[#2d5a27] shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>User</span>
              </button>

              {/* Admin Option */}
              <button
                onClick={() => setSimulationMode('admin')}
                className={`flex items-center gap-1.5 justify-center py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  simulationMode === 'admin'
                    ? 'bg-red-950/80 text-red-200 border-red-800 shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
