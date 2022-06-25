import { ReactElement } from 'react';
import Callout from 'nextra-theme-docs/callout';

export const OperationsNote = (): ReactElement => {
  return (
    <Callout type="warning" emoji="⚠️">
      <p>
        <strong>Usage Requirements</strong>
      </p>
      <p>
        In order to use this GraphQL Codegen plugin, please make sure that you have GraphQL operations (
        <code>query</code> / <code>mutation</code> / <code>subscription</code> and <code>fragment</code>) set as{' '}
        <code>documents: …</code> in your <code>codegen.yml</code>.
      </p>
      <p>
        Without loading your GraphQL operations (<code>query</code>, <code>mutation</code>, <code>subscription</code>{' '}
        and <code>fragment</code>), you won't see any change in the generated output.
      </p>
    </Callout>
  );
};
