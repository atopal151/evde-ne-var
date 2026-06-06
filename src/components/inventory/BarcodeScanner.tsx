"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BARCODE_PRODUCT_HINTS } from "@/lib/constants";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose?: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const containerId = useId().replace(/:/g, "");
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        /* scanner zaten durmuş olabilir */
      }
      scannerRef.current = null;
    }
    setActive(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      setActive(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          void stopScanner();
          onScan(decodedText);
        },
        () => {
          /* tarama devam ediyor */
        }
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Kamera erişimi reddedildi veya desteklenmiyor."
      );
      setActive(false);
    }
  }, [containerId, onScan, stopScanner]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const handleManualTest = () => {
    const sample = Object.keys(BARCODE_PRODUCT_HINTS)[0];
    onScan(sample);
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-navy-200 bg-navy-900">
        <div id={containerId} className="min-h-[220px] w-full" />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-900/90 p-6 text-center text-white">
            <Camera className="h-10 w-10 text-forest-400" />
            <p className="text-sm text-cream-200">
              Barkodu kameraya gösterin veya test barkodu kullanın
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {!active ? (
          <Button type="button" onClick={() => void startScanner()} className="flex-1">
            <Camera className="h-4 w-4" />
            Kamerayı Aç
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => void stopScanner()}
            className="flex-1 border-white/20 text-navy-800"
          >
            Taramayı Durdur
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={handleManualTest}>
          Test Barkodu
        </Button>
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function resolveBarcodeHint(barcode: string) {
  return BARCODE_PRODUCT_HINTS[barcode] ?? null;
}
