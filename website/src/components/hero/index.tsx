import { ReactNode } from 'react';
import { DecorationIsolation, cn, CodegenIcon } from '@theguild/components';
import Image from 'next/image';

import codegenHeroBadge from './codegen-badge.svg';

export function Hero(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative isolate flex max-w-[90rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-3xl bg-blue-400 px-4 py-6 sm:py-12 md:gap-8 lg:py-24',
        props.className
      )}
    >
      <DecorationIsolation className="-z-10">
        <CodegenIcon className="absolute left-[-180px] top-[calc(50%-180px)] size-[360px] fill-[url(#codegen-hero-gradient)] stroke-white/10 stroke-[0.1px] md:hidden lg:left-[-649px] lg:top-[-58px] lg:size-[1047px] xl:block" />
        <CodegenIcon className="absolute right-[-350px] top-2 size-[672px] fill-[url(#codegen-hero-gradient)] stroke-white/10 stroke-[0.1px] max-md:hidden" />
        <svg>
          <defs>
            <linearGradient id="codegen-hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="11.66%" stopColor="rgba(255, 255, 255, 0.10)" />
              <stop offset="74.87%" stopColor="rgba(255, 255, 255, 0.30)" />
            </linearGradient>
          </defs>
        </svg>
      </DecorationIsolation>
      <Image priority src={codegenHeroBadge.src} alt="" width="96" height="96" />
      {props.children}
    </div>
  );
}

export function HeroLinks(props: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex justify-center gap-2 px-0.5 max-sm:flex-col sm:gap-4">{props.children}</div>
  );
}

export function HeroFeatures(props: { children: ReactNode }) {
  return (
    <ul className="mx-auto flex list-none gap-x-6 gap-y-2 text-sm font-medium max-md:flex-col [&>li]:flex [&>li]:items-center [&>li]:gap-2">
      {props.children}
    </ul>
  );
}

export function HeroTitle(props: { children: ReactNode }) {
  return (
    <h1 className="mx-auto max-w-screen-lg bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500 bg-clip-text text-center text-5xl font-semibold text-transparent sm:text-5xl lg:text-6xl">
      {props.children}
    </h1>
  );
}

export function TrustedBy({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn('max-w-[80%] text-center', className)} {...rest}>
      <p className="text-base text-blue-800">Trusted by global enterprises and fast-moving startups</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-16 gap-y-6 text-blue-1000">{children}</div>
    </div>
  );
}
