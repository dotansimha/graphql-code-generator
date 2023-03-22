import { useQuery } from '@apollo/client';

import './App.css';
import { useFragment, graphql, FragmentType } from './gql';

export const slowFieldFragment = graphql(/* GraphQL */ `
  fragment SlowFieldFragment on Query {
    slowField
  }
`);

const alphabetQuery = graphql(/* GraphQL */ `
  query SlowAndFastFieldWithDefer {
    fastField
    ...SlowFieldFragment @defer
  }
`);

const SlowDataField = (props: { data: FragmentType<typeof slowFieldFragment> }) => {
  const fragment = useFragment(slowFieldFragment, props.data);
  // should be string | undefined
  return <p>{fragment.slowField}</p>;
};

function App() {
  const { data } = useQuery(alphabetQuery);
  return (
    <div className="App">
      {data && (
        <>
          <p>{data.fastField}</p>
          <SlowDataField data={data} />
        </>
      )}
    </div>
  );
}

export default App;
