import type { CompiledMDX } from '@guild-docs/server';
import type { ComponentProps } from 'react';
import { FC } from 'react';
import { Link } from '@chakra-ui/react';
import { MDX } from '@guild-docs/client';

const extraComponents = {
  a(props: ComponentProps<'a'>) {
    return (
      <Link
        display="inline"
        color="#2f77c9"
        _hover={{
          textDecoration: 'underline',
        }}
        target="_blank"
        {...props}
      />
    );
  },
};

const Markdown: FC<{ content: CompiledMDX }> = ({ content }) => {
  return <MDX mdx={content.mdx} extraComponents={extraComponents} />;
};

export default Markdown;
