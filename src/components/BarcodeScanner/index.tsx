/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

type Props = {
  onDetected: (codigo: string) => void;
};

const BarcodeScanner = ({ onDetected }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null); // guarda o controle do scanner

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);

    const reader = new BrowserMultiFormatReader(hints);

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            advanced: [{ focusMode: "continuous" }] as any[],
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();

          const controls = await reader.decodeFromVideoElement(
            videoRef.current,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (result, _error) => {
              if (result) {
                onDetected(result.getText());
              }
            }
          );

          controlsRef.current = controls; // armazena os controles para parar depois
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
      }
    };

    startScanner();

    return () => {
      controlsRef.current?.stop(); // ✅ libera câmera corretamente
      const tracks =
        videoRef.current?.srcObject instanceof MediaStream
          ? videoRef.current.srcObject.getTracks()
          : [];
      tracks?.forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div style={{ position: "relative", width: "100%", paddingTop: "25%" }}>
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          border: "2px solid #ccc",
          borderRadius: "8px",
        }}
        autoPlay
        muted
        playsInline
      />
    </div>
  );
};

export default BarcodeScanner;
