/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

type Props = {
  onDetected: (codigo: string) => void;
};

const BarcodeScanner = ({ onDetected }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);

    const reader = new BrowserMultiFormatReader(hints);

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 9999 },
            height: { ideal: 9999 },
            advanced: [{ focusMode: "continuous" }] as any[],
          },
        });

        const video = videoRef.current!;
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        await video.play();

        const scan = async () => {
          const vw = video.videoWidth;
          const vh = video.videoHeight;

          const cropHeight = vh * 0.25; // faixa de 25% da altura
          const cropY = (vh - cropHeight) / 2;

          canvas.width = vw;
          canvas.height = cropHeight;

          ctx.drawImage(video, 0, cropY, vw, cropHeight, 0, 0, vw, cropHeight);

          try {
            const result = await reader.decodeFromCanvas(canvas);
            if (result) {
              onDetected(result.getText());
            }
          } catch (err: any) {
            if (err.name !== "NotFoundException") {
              console.error("Erro de leitura:", err);
            }
          }

          animationRef.current = requestAnimationFrame(scan);
        };

        animationRef.current = requestAnimationFrame(scan);
      } catch (err) {
        console.error("Erro ao iniciar scanner:", err);
      }
    };

    startScanner();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
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
          borderRadius: "8px",
          border: "2px solid #ccc",
        }}
        muted
        playsInline
        autoPlay
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Moldura guia */}
      <div
        style={{
          position: "absolute",
          top: "37.5%",
          left: "10%",
          width: "80%",
          height: "25%",
          border: "2px dashed lime",
          borderRadius: "6px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default BarcodeScanner;
