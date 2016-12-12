export type FeedType = "HOT" | "NEW" | "TOP";

export interface Entry {
    repository: Repository;
    postedBy: User;
    createdAt: number;
    score: number;
    hotScore: number;
    comments: Array<Comment>;
    commentCount: number;
    id: number;
    vote: Vote;
}

export interface Repository {
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    open_issues_count: number | null;
    owner: User | null;
}

export interface User {
    login: string;
    avatar_url: string;
    html_url: string;
}

export interface Comment {
    id: number;
    postedBy: User;
    createdAt: number;
    content: string;
    repoName: string;
}

export interface Vote {
    vote_value: number;
}


export type VoteType = "UP" | "DOWN" | "CANCEL";

export namespace OnCommentAddedSubscription {
      export interface Variables {
          repoFullName: string;
      }

      export interface CommentAdded {
          id: number;
          postedBy: PostedBy;
          createdAt: number;
          content: string;
      }

      export interface PostedBy {
          login: string;
          html_url: string;
      }

      export interface Result {
          commentAdded: CommentAdded;
      }

}

export namespace CommentQuery {
      export interface Variables {
          repoFullName: string;
          limit: number | null;
          offset: number | null;
      }

      export interface CurrentUser {
          login: string;
          html_url: string;
      }

      export interface Result {
          currentUser: CurrentUser;
          entry: Entry;
      }

      export interface Entry {
          id: number;
          postedBy: PostedBy;
          createdAt: number;
          comments: Array<Comments>;
          commentCount: number;
          repository: Repository;
      }

      export interface PostedBy {
          login: string;
          html_url: string;
      }

      export type Comments = CommentsPageComment.Fragment & {
      }

      export interface Repository {
          full_name: string;
          html_url: string;
          description: string;
          open_issues_count: number;
          stargazers_count: number;
      }

}

export namespace CommentsPageComment {
      export interface Fragment {
          id: number;
          postedBy: PostedBy;
          createdAt: number;
          content: string;
      }

      export interface PostedBy {
          login: string;
          html_url: string;
      }

}

export namespace CurrentUserForProfileQuery {
      export interface CurrentUser {
          login: string;
          avatar_url: string;
      }

      export interface Result {
          currentUser: CurrentUser;
      }

}

export namespace FeedEntry {
      export type Fragment = VoteButtons.Fragment & RepoInfo.Fragment & {
        id: number;
        commentCount: number;
        repository: Repository;
      }

      export interface Repository {
          full_name: string;
          html_url: string;
          owner: Owner;
      }

      export interface Owner {
          avatar_url: string;
      }

}

export namespace FeedQuery {
      export interface Variables {
          type: FeedType;
          offset: number | null;
          limit: number | null;
      }

      export interface CurrentUser {
          login: string;
      }

      export interface Result {
          currentUser: CurrentUser;
          feed: Array<Feed>;
      }

      export type Feed = FeedEntry.Fragment & {
      }

}

export namespace SubmitRepositoryMutation {
      export interface Variables {
          repoFullName: string;
      }

      export interface SubmitRepository {
          createdAt: number;
      }

      export interface Result {
          submitRepository: SubmitRepository;
      }

}

export namespace RepoInfo {
      export interface Fragment {
          createdAt: number;
          repository: Repository;
          postedBy: PostedBy;
      }

      export interface Repository {
          description: string;
          stargazers_count: number;
          open_issues_count: number;
      }

      export interface PostedBy {
          html_url: string;
          login: string;
      }

}

export namespace SubmitCommentMutation {
      export interface Variables {
          repoFullName: string;
          commentContent: string;
      }

      export type SubmitComment = CommentsPageComment.Fragment & {
      }

      export interface Result {
          submitComment: SubmitComment;
      }

}

export namespace VoteButtons {
      export interface Fragment {
          score: number;
          vote: Vote;
      }

      export interface Vote {
          vote_value: number;
      }

}

export namespace VoteMutation {
      export interface Variables {
          repoFullName: string;
          type: VoteType;
      }

      export interface Vote {
          score: number;
          id: number;
          vote: _Vote;
      }

      export interface _Vote {
          vote_value: number;
      }

      export interface Result {
          vote: Vote;
      }

}

