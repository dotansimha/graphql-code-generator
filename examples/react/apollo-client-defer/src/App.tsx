import { useQuery } from '@apollo/client';

import './App.css';
import { useFragment, graphql, FragmentType, isFragmentReady } from './gql';
import { SlowAndFastFieldWithDeferQuery } from './gql/graphql';

export const slowFieldFragment = graphql(/* GraphQL */ `
  fragment SlowFieldFragment on Query {
    slowField(waitFor: 5000)
  }
`);

const alphabetQuery = graphql(/* GraphQL */ `
  query SlowAndFastFieldWithDefer {
    fastField
    ...SlowFieldFragment @defer

    ... @defer {
      inlinedSlowField: slowField(waitFor: 5000)
    }
  }
`);

const SlowDataField = (props: { data: FragmentType<typeof slowFieldFragment> }) => {
  const data = useFragment(slowFieldFragment, props.data);
  return <p>{data.slowField}</p>;
};

const InlinedSlowDataField = (props: { data: SlowAndFastFieldWithDeferQuery }) => {
  try {
    // @ts-expect-error - this field should be either undefined or a string
    const _ = props.data.inlinedSlowField.toLowerCase();
  } catch (e) {}

  if (!props.data.inlinedSlowField) {
    return null;
  }
  return <p>{props.data.inlinedSlowField} inlined fragment</p>;
};

function App() {
  const { data } = useQuery(alphabetQuery);

  return (
    <div className="App">
      {data && (
        <>
          <p>{data.fastField}</p>
          {isFragmentReady(alphabetQuery, slowFieldFragment, data) && <SlowDataField data={data} />}
          <InlinedSlowDataField data={data} />
        </>
      )}
    </div>
  );
}

export default App;
