import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw } from 'lucide-react';

const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannerError, setScannerError] = useState(null);
  const [html5QrcodeInstance, setHtml5QrcodeInstance] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let qrcodeInstance = null;
    let isMounted = true;

    if (!isOpen) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      try {
        setScannerError(null);
        qrcodeInstance = new Html5Qrcode('reader-element');
        if (!isMounted) return;
        setHtml5QrcodeInstance(qrcodeInstance);

        // Fetch cameras
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) {
          return;
        }

        if (devices && devices.length > 0) {
          // Choose back/environment camera if available, otherwise first camera
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          const cameraId = backCamera ? backCamera.id : devices[0].id;

          await qrcodeInstance.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 260, height: 160 }, // barcode optimized rectangular scanning area
            },
            (decodedText) => {
              // On success
              onScanSuccess(decodedText);
              // Stop camera and close
              qrcodeInstance.stop()
                .then(() => {
                  if (isMounted) onClose();
                })
                .catch(err => {
                  console.error('Error stopping scanner:', err);
                  if (isMounted) onClose();
                });
            },
            (errorMessage) => {
              // Silent log, scanning loop failures are normal
            }
          );
          if (isMounted) setCameraActive(true);
        } else {
          if (isMounted) setScannerError('No camera devices found. Please enter barcode manually.');
        }
      } catch (err) {
        console.error('Failed to initialize camera scanner:', err);
        if (isMounted) setScannerError('Camera access denied or failed to load scanner. Please enter barcode manually.');
      }
    };

    // Delay start slightly to ensure DOM element is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (qrcodeInstance) {
        if (qrcodeInstance.isScanning) {
          qrcodeInstance.stop().catch(err => {
            console.error('Error stopping scanner on unmount:', err);
          });
        }
      }
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (html5QrcodeInstance && html5QrcodeInstance.isScanning) {
      try {
        await html5QrcodeInstance.stop();
      } catch (err) {
        console.error('Error while stopping scanner in cleanup:', err);
      }
    }
    setCameraActive(false);
    setHtml5QrcodeInstance(null);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScanSuccess(manualBarcode.trim());
      stopScanner().then(() => onClose());
    }
  };

  const handleClose = () => {
    stopScanner().then(() => onClose());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-900 bg-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-950 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2 text-indigo-400">
            <Camera className="h-5 w-5" />
            <h3 className="text-base font-bold text-white">Scan Barcode</h3>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-950 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scanner Feed Panel */}
        <div className="p-6 space-y-6">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
            {/* Target overlay guide */}
            {cameraActive && (
              <div className="absolute inset-0 z-10 border-[30px] border-slate-950/45 flex items-center justify-center">
                <div className="relative h-[80px] w-[200px] border-2 border-dashed border-indigo-400 rounded-md shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center">
                  <div className="absolute h-0.5 w-[190px] bg-indigo-500 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Html5Qrcode Target Element */}
            <div id="reader-element" className="h-full w-full object-cover"></div>

            {/* Loading / Error overlay */}
            {!cameraActive && !scannerError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="text-xs">Initializing camera feed...</span>
              </div>
            )}

            {scannerError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-slate-400">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <span className="text-xs font-semibold">{scannerError}</span>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500">
            Align the product barcode within the guide container to scan.
          </div>

          {/* Separation line */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-950"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-slate-950"></div>
          </div>

          {/* Manual input form */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                Enter Barcode Manually
              </label>
              <input
                type="text"
                placeholder="e.g. 0123456789012"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all duration-200"
            >
              Lookup Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
