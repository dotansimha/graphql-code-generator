public enum FeedType: String {
    case HOT = "HOT"
    case NEW = "NEW"
    case TOP = "TOP"
}

public struct Entry: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

  public init(repository: Repository, postedBy: User, createdAt: Float, score: Int, hotScore: Float, comments: [Comment], commentCount: Int, id: Int, vote: Vote) {
    fieldsMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt, "score": score, "hotScore": hotScore, "comments": comments, "commentCount": commentCount, "id": id, "vote": vote]
  }
}

public struct Repository: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

  public init(name: String, full_name: String, description: String?, html_url: String, stargazers_count: Int, open_issues_count: Int?, owner: User?) {
    fieldsMap = ["name": name, "full_name": full_name, "description": description, "html_url": html_url, "stargazers_count": stargazers_count, "open_issues_count": open_issues_count, "owner": owner]
  }
}

public struct User: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

  public init(login: String, avatar_url: String, html_url: String) {
    fieldsMap = ["login": login, "avatar_url": avatar_url, "html_url": html_url]
  }
}

public struct Comment: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

  public init(id: Int, postedBy: User, createdAt: Float, content: String, repoName: String) {
    fieldsMap = ["id": id, "postedBy": postedBy, "createdAt": createdAt, "content": content, "repoName": repoName]
  }
}

public struct Vote: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

  public init(vote_value: Int) {
    fieldsMap = ["vote_value": vote_value]
  }
}

public struct A: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

  public init(test: MyType) {
    fieldsMap = ["test": test]
  }
}

public enum VoteType: String {
    case UP = "UP"
    case DOWN = "DOWN"
    case CANCEL = "CANCEL"
}

