import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScanContextType {
  isScanning: boolean;
  startScan: (onResult?: (data: string) => void, onCancel?: () => void) => void;
  stopScan: () => void;
  onScanResult?: (data: string) => void;
  onScanCancel?: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

interface ScanProviderProps {
  children: ReactNode;
}

export const ScanProvider: React.FC<ScanProviderProps> = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [onScanResult, setOnScanResult] = useState<((data: string) => void) | undefined>();
  const [onScanCancel, setOnScanCancel] = useState<(() => void) | undefined>();

  const startScan = (
    onResult?: (data: string) => void,
    onCancel?: () => void
  ) => {
    setOnScanResult(() => onResult);
    setOnScanCancel(() => onCancel);
    setIsScanning(true);
  };

  const stopScan = () => {
    setIsScanning(false);
    setOnScanResult(undefined);
    setOnScanCancel(undefined);
  };

  return (
    <ScanContext.Provider
      value={{
        isScanning,
        startScan,
        stopScan,
        onScanResult,
        onScanCancel,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
