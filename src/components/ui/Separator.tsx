import { cn } from '@/lib/utils';

type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

export function Separator({
  orientation = 'horizontal',
  className,
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full my-4' : 'w-px h-full mx-4',
        className,
      )}
    />
  );
}
