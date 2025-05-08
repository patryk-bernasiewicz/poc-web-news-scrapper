'use client';

import { useNotifications } from '../hooks/useNotifications';

type ProtectedWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

export const ProtectedWrapper = ({
  children,
  className,
}: ProtectedWrapperProps) => {
  useNotifications();

  return <div className={className}>{children}</div>;
};
