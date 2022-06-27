import type { CompiledMDX } from '@guild-docs/server';
import type { ComponentProps, ReactElement } from 'react';
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

const Markdown = ({ content }: { content: CompiledMDX }): ReactElement => {
  return <MDX mdx={content.mdx} extraComponents={extraComponents} />;
};

export default Markdown;
