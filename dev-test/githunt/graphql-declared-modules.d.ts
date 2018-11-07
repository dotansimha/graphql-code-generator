/*tslint:disable*/
declare module '*/comment-added.subscription.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  const onCommentAdded: DocumentNode;

  export { onCommentAdded };

  export default defaultDocument;
}

declare module '*/comment.query.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  const Comment: DocumentNode;

  export { Comment };

  export default defaultDocument;
}

declare module '*/current-user.query.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  const CurrentUserForProfile: DocumentNode;

  export { CurrentUserForProfile };

  export default defaultDocument;
}

declare module '*/feed.query.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  const GetFeed: DocumentNode;

  export { GetFeed };

  export default defaultDocument;
}

declare module '*/new-entry.mutation.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  const submitRepository: DocumentNode;

  export { submitRepository };

  export default defaultDocument;
}

declare module '*/submit-comment.mutation.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  const submitComment: DocumentNode;

  export { submitComment };

  export default defaultDocument;
}

declare module '*/vote.mutation.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;
  const vote: DocumentNode;

  export { vote };

  export default defaultDocument;
}

declare module '*/comments-page-comment.fragment.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;

  export {};

  export default defaultDocument;
}

declare module '*/feed-entry.fragment.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;

  export {};

  export default defaultDocument;
}

declare module '*/repo-info.fragment.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;

  export {};

  export default defaultDocument;
}

declare module '*/vote-buttons.fragment.graphql' {
  import { DocumentNode } from 'graphql';
  const defaultDocument: DocumentNode;

  export {};

  export default defaultDocument;
}
