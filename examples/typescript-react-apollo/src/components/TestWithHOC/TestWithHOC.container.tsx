import { TestWithHOCView } from './TestWithHOC.view';
import { AllPosts } from '../../generated-models';

const withUser = AllPosts.HOC({
  options: {
    variables: {
      id: Date.now().toString()
    }
  }
});

export const TestWithHOC = withUser(TestWithHOCView);
