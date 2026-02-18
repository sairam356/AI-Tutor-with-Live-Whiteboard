import { ReactNode } from "react";

interface LayoutProps {
  chatPanel: ReactNode;
  canvas: ReactNode;
}

export function Layout({ chatPanel, canvas }: LayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      {/* Chat Panel — 40% width */}
      <div className="w-[40%] min-w-[320px] max-w-[600px] flex-none border-r border-gray-800 flex flex-col overflow-hidden">
        {chatPanel}
      </div>

      {/* Canvas — remaining 60% */}
      <div className="flex-1 overflow-hidden relative">
        {canvas}
      </div>
    </div>
  );
}
