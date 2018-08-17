import { TestWithHOCView } from './TestWithHOC.view';
import { UserQuery } from '../../generated-models';

const withUser = UserQuery.HOC({
  options: {
    variables: {
      id: Date.now().toString()
    }
  }
});

export const TestWithHOC = withUser(TestWithHOCView);
