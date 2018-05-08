import { VoteButtons } from './votebuttons.fragment';
import { RepoInfo } from './repoinfo.fragment';
export namespace FeedEntry {
  export type Fragment = {
    __typename?: 'Entry';
    id: number;
    commentCount: number;
    repository: Repository;
  } & VoteButtons.Fragment &
    RepoInfo.Fragment;
  export type Repository = {
    __typename?: 'Repository';
    full_name: string;
    html_url: string;
    owner?: Owner | null;
  };
  export type Owner = {
    __typename?: 'User';
    avatar_url: string;
  };
}
