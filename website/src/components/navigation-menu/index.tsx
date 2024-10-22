import { ComponentPropsWithoutRef } from 'react';
import { useRouter } from 'next/router';
import { HiveNavigation, PRODUCTS, type Navbar } from '@theguild/components';

export function NavigationMenu(props: ComponentPropsWithoutRef<typeof Navbar>) {
  const { route } = useRouter();

  return (
    <HiveNavigation
      className={route === '/' ? 'light max-w-[1392px]' : 'max-w-[90rem]'}
      productName={PRODUCTS.CODEGEN.name}
      {...props}
    />
  );
}
