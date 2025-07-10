/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

type Props = {
  onDetected: (codigo: string) => void;
};

const BarcodeScanner = ({ onDetected }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
    const codeReader = new BrowserMultiFormatReader(hints);

    if (videoRef.current) {
      codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, _error, controls) => {
          if (controls) {
            controlsRef.current = controls;
          }
          if (result) {
            onDetected(result.getText());
          }
        }
      );
    }

    return () => {
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  return (
    <div>
      <video
        ref={videoRef}
        style={{ width: "100%", border: "1px solid #ccc", borderRadius: "8px" }}
        autoPlay
        muted
      />
    </div>
  );
};

export default BarcodeScanner;
