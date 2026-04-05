import { ReactNode } from 'react';
import { cn } from '@theguild/components';

export function Page(props: { children: ReactNode; className?: string }) {
  return <div className={cn('flex h-full flex-col', props.className)}>{props.children}</div>;
}
