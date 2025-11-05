"use client";

import React from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

import Button from "@/components/ui/Button";
import { useI18n } from "@/i18n/client";

type Props = {
  onDetected: (value: string) => void;
};

export default function CameraScanner({ onDetected }: Props) {
  const { t } = useI18n();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const controlsRef = React.useRef<IScannerControls | null>(null);
  const [active, setActive] = React.useState(false);
  const [supported, setSupported] = React.useState<boolean | null>(null);
  const hints = React.useMemo(() => {
    const map = new Map<DecodeHintType, unknown>();
    map.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);
    return map;
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      setSupported(false);
      return;
    }
    const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;
    setSupported(hasMediaDevices);
  }, []);

  React.useEffect(() => {
    if (!active || supported === false) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 200,
      delayBetweenScanSuccess: 400,
    });

    let stopped = false;

    reader
      .decodeFromVideoDevice(
        undefined,
        videoElement,
        (result, err, controls) => {
          if (stopped) return;
          if (result) {
            onDetected(result.getText());
            controlsRef.current = controls;
            controls?.stop();
            setActive(false);
          }
        }
      )
      .then((controls) => {
        if (stopped) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      })
      .catch(() => {
        setActive(false);
      });

    return () => {
      stopped = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      //reader.reset();
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [active, hints, onDetected, supported]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        Scanning not supported in this browser. Enter ISBN manually.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {!active ? (
        <Button onClick={() => setActive(true)} variant="outline">
          {t("scan_isbn")}
        </Button>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" />
        </div>
      )}
    </div>
  );
}
