"use client";
import React, { createContext, useContext, ReactNode, useState } from "react";

type HeaderContextType = {
  setHeaderContent: (content: ReactNode) => void;
  headerContent: ReactNode | null;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);
  
  return (
    <HeaderContext.Provider 
      value={{ 
        headerContent, 
        setHeaderContent
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
}
