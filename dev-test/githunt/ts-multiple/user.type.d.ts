/* A user object from the GitHub API. This uses the exact field names returned from the GitHub API. */
export interface User {
  login: string; /* The name of the user, e.g. apollostack */
  avatar_url: string; /* The URL to a directly embeddable image for this user&#x27;s avatar */
  html_url: string; /* The URL of this user&#x27;s GitHub page */
}

