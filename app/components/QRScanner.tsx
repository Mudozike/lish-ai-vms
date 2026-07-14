'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
    }, false);

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (error) => {
        // Ignore errors from non-QR codes
        if (error && !error.includes('No MultiFormat')) {
          console.debug('QR Scanner error:', error);
        }
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [isScanning, onScan]);

  return (
    <div>
      <div id="qr-reader" style={{ width: '100%', minHeight: '400px' }}></div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setIsScanning(!isScanning)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isScanning ? 'Stop' : 'Start'} Scanning
        </button>
      </div>
    </div>
  );
}
