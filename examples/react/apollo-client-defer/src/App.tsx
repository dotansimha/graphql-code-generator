import { useQuery } from '@apollo/client';

import './App.css';
import { graphql } from './gql/gql';

const alphabetQuery = graphql(/* GraphQL */ `
  query SlowAndFastFieldWithDefer {
    fastField
    ... on Query @defer {
      slowField
    }
  }
`);

const Field = ({ field }: { field: string }) => {
  return <p>{field}</p>;
};

function App() {
  const { data } = useQuery(alphabetQuery);
  return (
    <div className="App">
      {data && (
        <>
          <Field field={data?.fastField} />
          {/* @ts-expect-error expected because slowField can be undefined */}
          <Field field={data?.slowField} />
        </>
      )}
    </div>
  );
}

export default App;
