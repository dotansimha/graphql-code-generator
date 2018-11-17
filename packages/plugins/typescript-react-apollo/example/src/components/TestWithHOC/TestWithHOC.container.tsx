import { TestWithHOCView } from './TestWithHOC.view';
import { AllPostsHOC } from '../../generated-models';

const withUser = AllPostsHOC({
  options: {
    variables: {
      id: Date.now().toString()
    }
  }
});

export const TestWithHOC = withUser(TestWithHOCView);
