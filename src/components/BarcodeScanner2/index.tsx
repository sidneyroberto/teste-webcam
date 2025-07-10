import { useMediaDevices } from "react-media-devices";
import { useZxing } from "react-zxing";

type Props = {
  onDetected: (codigo: string) => void;
};

const constraints: MediaStreamConstraints = {
  video: {
    facingMode: "environment",
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

const BarcodeScanner2 = ({ onDetected }: Props) => {
  const { devices } = useMediaDevices({ constraints });
  const deviceId = devices?.[0]?.deviceId;
  const { ref } = useZxing({
    onDecodeResult(result) {
      onDetected(result.getText());
    },
    deviceId,
  });

  return (
    <div>
      <video
        ref={ref}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
        autoPlay
        muted
      />
    </div>
  );
};

export default BarcodeScanner2;
