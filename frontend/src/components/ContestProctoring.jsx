import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  X, 
  Maximize2, 
  Minimize2,
  AlertOctagon,
  CheckCircle2,
  Lock
} from 'lucide-react';

// Play an instant synthesized warning beep using Web Audio API
const playWarningBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (err) {
    // AudioContext might be blocked before first user gesture
  }
};

export const ContestProctoring = ({ contestTitle = 'CodeXa Contest', onViolation }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraStatus, setCameraStatus] = useState('prompting'); // 'prompting', 'active', 'denied'
  const [cameraError, setCameraError] = useState('');
  const [violations, setViolations] = useState([]);
  const [currentWarning, setCurrentWarning] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // 1. Initialize and request camera stream
  const startCamera = async () => {
    try {
      setCameraStatus('prompting');
      setCameraError('');
      setShowPermissionModal(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('denied');
        setCameraError('Camera access API is not supported in this browser.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraStatus('active');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera permission denied or camera not found:', err);
      setCameraStatus('denied');
      setShowPermissionModal(true);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Live webcam monitoring is required for proctored contests.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No webcam was detected on your device.');
      } else {
        setCameraError('Unable to access webcam: ' + (err.message || 'Unknown error'));
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      // Clean up camera stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update video element when stream or videoRef becomes available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isMinimized]);

  // 2. Trigger violation warning
  const recordViolation = (reason, code = 'PROCTOR_VIOLATION') => {
    playWarningBeep();
    const violationEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      reason,
      code
    };

    setViolations((prev) => {
      const next = [violationEntry, ...prev];
      if (onViolation) onViolation(violationEntry, next.length);
      return next;
    });

    setCurrentWarning({
      message: reason,
      count: violations.length + 1
    });
  };

  // 3. Intercept and block Ctrl+C, Ctrl+V, Cut, ContextMenu, and Tab Switches
  useEffect(() => {
    // Block keyboard shortcuts: Ctrl+C, Ctrl+V, Ctrl+X, Cmd+C, Cmd+V, Cmd+X
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key ? e.key.toLowerCase() : '';

      // Intercept Copy (Ctrl+C / Cmd+C)
      if (isCtrlOrCmd && key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        recordViolation('Action Blocked: Copying (Ctrl + C) is strictly prohibited during the contest!');
        return false;
      }

      // Intercept Paste (Ctrl+V / Cmd+V)
      if (isCtrlOrCmd && key === 'v') {
        e.preventDefault();
        e.stopPropagation();
        recordViolation('Action Blocked: Pasting (Ctrl + V) is strictly prohibited during the contest! Solutions must be written manually.');
        return false;
      }

      // Intercept Cut (Ctrl+X / Cmd+X)
      if (isCtrlOrCmd && key === 'x') {
        e.preventDefault();
        e.stopPropagation();
        recordViolation('Action Blocked: Cutting text (Ctrl + X) is disabled during the contest.');
        return false;
      }

      // Intercept DevTools inspect shortcuts
      if (e.key === 'F12' || (isCtrlOrCmd && e.shiftKey && (key === 'i' || key === 'j'))) {
        e.preventDefault();
        e.stopPropagation();
        recordViolation('Action Blocked: Developer tools access is restricted during the contest.');
        return false;
      }
    };

    // Intercept native clipboard events
    const handleCopy = (e) => {
      e.preventDefault();
      recordViolation('Action Blocked: Copy action detected and blocked.');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      recordViolation('Action Blocked: Paste action detected and blocked. All code must be typed manually.');
    };

    const handleCut = (e) => {
      e.preventDefault();
      recordViolation('Action Blocked: Cut action detected and blocked.');
    };

    // Intercept right click context menu (prevents right-click -> Paste)
    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation('Action Blocked: Right-click context menu is disabled to prevent pasting.');
    };

    // Intercept Tab Switching / Window Blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Security Warning: Tab switch or window minimization detected! Contest window lost focus.', 'TAB_SWITCH');
      }
    };

    const handleWindowBlur = () => {
      recordViolation('Security Warning: Browser window lost focus. Switching windows during proctored contests is monitored.', 'WINDOW_BLUR');
    };

    // Register with capture=true to intercept before any other editor listener
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [violations.length]);

  return (
    <>
      {/* 1. FLOATING WEBCAM PROCTORING WIDGET */}
      <div 
        className={`fixed z-50 transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border-2 select-none ${
          violations.length > 0 ? 'border-rose-500' : 'border-emerald-500'
        } ${
          isMinimized 
            ? 'bottom-4 right-4 w-52 bg-slate-900/95 text-white' 
            : 'bottom-4 right-4 w-64 bg-slate-900/95 text-white backdrop-blur-md'
        }`}
      >
        {/* Widget Top Header */}
        <div className="px-3 py-2 bg-slate-800 flex items-center justify-between text-xs border-b border-slate-700">
          <div className="flex items-center gap-1.5 font-bold tracking-tight">
            {cameraStatus === 'active' ? (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            )}
            <span className="text-[11px] uppercase tracking-wider text-slate-200">
              {cameraStatus === 'active' ? 'Live Proctoring' : 'Proctoring'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            {violations.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                {violations.length} {violations.length === 1 ? 'alert' : 'alerts'}
              </span>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:bg-slate-700 hover:text-white transition-colors"
              title={isMinimized ? 'Expand Camera' : 'Minimize Camera'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Video Camera Feed */}
        {!isMinimized && (
          <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
            {cameraStatus === 'active' ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100" // Mirror view
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>REC • LIVE</span>
                </div>
              </>
            ) : cameraStatus === 'prompting' ? (
              <div className="p-4 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[11px] text-slate-300">Connecting webcam...</p>
              </div>
            ) : (
              <div className="p-3 text-center space-y-2">
                <CameraOff className="w-6 h-6 text-rose-400 mx-auto" />
                <p className="text-[10px] text-rose-300 leading-tight">Camera not accessible</p>
                <button
                  onClick={startCamera}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all shadow-xs"
                >
                  Enable Camera
                </button>
              </div>
            )}
          </div>
        )}

        {/* Anti-Cheat Status Footer */}
        <div className="px-3 py-1.5 bg-slate-900 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
          <div className="flex items-center gap-1 text-emerald-400">
            <Lock className="w-3 h-3" />
            <span>Anti-Cheat Guard Active</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">Ctrl+C/V Locked</span>
        </div>
      </div>

      {/* 2. PROMINENT PROCTORING WARNING MODAL (Appears on Ctrl+C / Ctrl+V / Tab Switch) */}
      {currentWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PROCTORING ALERT #{currentWarning.count}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Anti-Cheat Policy Violation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {currentWarning.message}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 text-slate-600">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-amber-500" />
                Contest Rules & Regulations:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                <li>Copying (Ctrl+C) and Pasting (Ctrl+V) are strictly blocked.</li>
                <li>Solutions must be typed and coded manually in the editor.</li>
                <li>Tab switching and window minimization are logged to judges.</li>
                <li>Live camera feed must remain unobstructed.</li>
              </ul>
            </div>

            <button
              onClick={() => setCurrentWarning(null)}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95"
            >
              I Understand — Return to Contest
            </button>
          </div>
        </div>
      )}

      {/* 3. CAMERA PERMISSION REQUIRED DIALOG */}
      {showPermissionModal && cameraStatus === 'denied' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-300 space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Camera className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Webcam Access Required
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                Camera Proctoring Notice
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {cameraError || 'To maintain integrity and fairness, CodeXa proctored contests require webcam monitoring throughout the contest.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={startCamera}
                className="w-full py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white font-bold text-sm shadow-sm transition-all"
              >
                Allow / Reconnect Camera
              </button>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Continue Anyway (Flagged for Review)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
