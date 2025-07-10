/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMediaDevices } from "react-media-devices";
import { useZxing } from "react-zxing";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  onDetected: (codigo: string) => void;
};

const continuousConstraints: MediaStreamConstraints = {
  video: {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 },
    advanced: [{ focusMode: "continuous" }] as any[],
  },
};

const singleShotConstraints: MediaStreamConstraints = {
  video: {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 },
    advanced: [{ focusMode: "single-shot" }] as any[],
  },
};

const BarcodeScanner2 = ({ onDetected }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { devices } = useMediaDevices({ constraints: continuousConstraints });
  const deviceId = devices?.[0]?.deviceId;

  const { ref } = useZxing({
    onDecodeResult(result) {
      onDetected(result.getText());
    },
    deviceId,
  });

  // Sincroniza as refs manualmente
  useEffect(() => {
    if (videoRef.current && ref.current !== videoRef.current) {
      ref.current = videoRef.current;
    }
  }, [ref]);

  useEffect(() => {
    const setupStream = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia(
          continuousConstraints
        );
        setStream(localStream);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
      }
    };

    setupStream();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [deviceId]);

  const handleTapToFocus = useCallback(async () => {
    try {
      stream?.getTracks().forEach((track) => track.stop());

      const newStream = await navigator.mediaDevices.getUserMedia(
        singleShotConstraints
      );
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Erro ao tentar foco manual:", err);
    }
  }, [stream]);

  return (
    <div>
      <video
        ref={videoRef}
        onClick={handleTapToFocus}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
        autoPlay
        muted
        playsInline
      />
      <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#555" }}>
        Toque na tela para tentar ajustar o foco
      </p>
    </div>
  );
};

export default BarcodeScanner2;
