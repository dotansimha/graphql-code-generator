import { User } from './user.type';
/* A repository object from the GitHub API. This uses the exact field names returned by the
GitHub API for simplicity, even though the convention for GraphQL is usually to camel case. */
export interface Repository {
  name: string; /* Just the name of the repository, e.g. GitHunt-API */
  full_name: string; /* The full name of the repository with the username, e.g. apollostack/GitHunt-API */
  description?: string; /* The description of the repository */
  html_url: string; /* The link to the repository on GitHub */
  stargazers_count: number; /* The number of people who have starred this repository on GitHub */
  open_issues_count?: number; /* The number of open issues on this repository on GitHub */
  owner?: User; /* The owner of this repository on GitHub, e.g. apollostack */
}

