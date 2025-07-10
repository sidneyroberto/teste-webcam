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

        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        // ✅ Aplica zoom 2x, se suportado
        if (capabilities.zoom) {
          const zoomLevel = Math.min(2, capabilities.zoom.max);
          await track.applyConstraints({
            advanced: [{ zoom: zoomLevel }] as any[],
          });
          console.log("Zoom aplicado:", zoomLevel);
        } else {
          console.warn("Zoom não suportado pelo dispositivo.");
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();

          const controls = await reader.decodeFromVideoElement(
            videoRef.current,
            (result, error) => {
              if (result) {
                onDetected(result.getText());
              }
              if (error && error.name !== "NotFoundException") {
                console.error("Erro de leitura:", error);
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
    <div>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          borderRadius: "8px",
          border: "2px solid #ccc",
        }}
        autoPlay
        muted
      />
    </div>
  );
};

export default BarcodeScanner;
