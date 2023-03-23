import { useQuery } from '@apollo/client';

import './App.css';
import { useFragment, graphql } from './gql';
import { SlowFieldFragmentFragment } from './gql/graphql';

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

const SlowDataField = (props: { data: SlowFieldFragmentFragment }) => {
  return <p>{props.data.slowField}</p>;
};

function App() {
  const { data } = useQuery(alphabetQuery);
  const slowData = useFragment(slowFieldFragment, data);
  return (
    <div className="App">
      {data && (
        <>
          <p>{data.fastField}</p>
          {slowData?.slowField && <SlowDataField data={slowData} />}
        </>
      )}
    </div>
  );
}

export default App;
