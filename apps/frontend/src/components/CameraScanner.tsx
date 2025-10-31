"use client";

import React from "react";
import Button from "@/components/ui/Button";

type Props = {
  onDetected: (value: string) => void;
};

export default function CameraScanner({ onDetected }: Props) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [active, setActive] = React.useState(false);
  const [supported, setSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Check BarcodeDetector support
    // @ts-expect-error - not in TS lib on all versions
    const ok = typeof window !== "undefined" && window.BarcodeDetector;
    setSupported(!!ok);
  }, []);

  React.useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let detector: any;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        // @ts-expect-error
        detector = new window.BarcodeDetector({ formats: ["ean_13", "upc_a", "ean_8"] });
        const tick = async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const first = codes?.[0]?.rawValue as string | undefined;
            if (first) {
              onDetected(first);
              stop();
              return;
            }
          } catch {}
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        stop();
      }
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      if (videoRef.current) videoRef.current.pause();
      stream?.getTracks().forEach((t) => t.stop());
      setActive(false);
    }

    start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (supported === false) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        Scanning not supported in this browser. Enter ISBN manually.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {!active ? (
        <Button onClick={() => setActive(true)} variant="outline">
          Scan ISBN with Camera
        </Button>
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" />
        </div>
      )}
    </div>
  );
}

