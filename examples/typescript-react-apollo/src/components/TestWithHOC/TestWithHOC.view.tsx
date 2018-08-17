import * as React from 'react';
import { DataProps } from 'react-apollo';
import { UserQuery } from '../../generated-models';

interface TestWithHOCViewProps extends DataProps<UserQuery.Query, UserQuery.Variables> {}

export class TestWithHOCView extends React.Component<TestWithHOCViewProps> {
  render() {
    if (this.props.data.loading) return 'Loading...';
    if (this.props.data.error) return `Error! ${this.props.data.error.message}`;
    return (
      <dl>
        <dt>
          <strong>First Name:</strong>
        </dt>
        <dd>{this.props.data.User.firstName}</dd>
        <dt>
          <strong>Last Name:</strong>
        </dt>
        <dd>{this.props.data.User.lastName}</dd>
        <dt>
          <strong>Email:</strong>
        </dt>
        <dd>{this.props.data.User.email}</dd>
        <dt>
          <strong>Avatar:</strong>
        </dt>
        <dd>
          <img src={this.props.data.User.avatar} />
        </dd>
      </dl>
    );
  }
}
