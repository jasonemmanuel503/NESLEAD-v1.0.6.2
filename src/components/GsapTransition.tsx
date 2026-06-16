import React, { ReactNode } from 'react';

interface GsapTransitionProps {
  activeKey: string;
  children: ReactNode;
}

export default function GsapTransition({ activeKey, children }: GsapTransitionProps) {
  return <div key={activeKey} className="transition-all duration-300">{children}</div>;
}
