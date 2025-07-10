// pages/Leitor.tsx (ou algum componente seu)
import { useState } from "react";

import "./App.css";
import BarcodeScanner2 from "./components/BarcodeScanner2";

const App = () => {
  const [codigoLido, setCodigoLido] = useState<string | null>(null);

  const lidarComCodigo = (codigo: string) => {
    setCodigoLido(codigo);
    // Aqui você pode buscar o item no backend, redirecionar, etc.
    console.log("Código lido:", codigo);
  };

  return (
    <div>
      <h2>Escaneie o código de barras do item</h2>
      <BarcodeScanner2 onDetected={lidarComCodigo} />

      {codigoLido && (
        <p>
          <strong>Código detectado:</strong> {codigoLido}
        </p>
      )}
    </div>
  );
};

export default App;
