public enum FeedType: String {
    case HOT = "HOT"
    case NEW = "NEW"
    case TOP = "TOP"
}

public struct Entry: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

    public init() {
      fieldsMap = []
    }

    public init(repository: Repository) {
      fieldsMap = ["repository": repository]
    }

    public init(repository: Repository, postedBy: User) {
      fieldsMap = ["repository": repository, "postedBy": postedBy]
    }

    public init(repository: Repository, postedBy: User, createdAt: Float) {
      fieldsMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt]
    }

    public init(repository: Repository, postedBy: User, createdAt: Float, score: Int) {
      fieldsMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt, "score": score]
    }

    public init(repository: Repository, postedBy: User, createdAt: Float, score: Int, hotScore: Float) {
      fieldsMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt, "score": score, "hotScore": hotScore]
    }

    public init(repository: Repository, postedBy: User, createdAt: Float, score: Int, hotScore: Float, comments: [Comment]) {
      fieldsMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt, "score": score, "hotScore": hotScore, "comments": comments]
    }

    public init(repository: Repository, postedBy: User, createdAt: Float, score: Int, hotScore: Float, comments: [Comment], commentCount: Int) {
      fieldsMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt, "score": score, "hotScore": hotScore, "comments": comments, "commentCount": commentCount]
    }

    public init(repository: Repository, postedBy: User, createdAt: Float, score: Int, hotScore: Float, comments: [Comment], commentCount: Int, id: Int) {
      fieldsMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt, "score": score, "hotScore": hotScore, "comments": comments, "commentCount": commentCount, "id": id]
    }

}

public struct Repository: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

    public init() {
      fieldsMap = []
    }

    public init(name: String) {
      fieldsMap = ["name": name]
    }

    public init(name: String, full_name: String) {
      fieldsMap = ["name": name, "full_name": full_name]
    }

    public init(name: String, full_name: String, description: String?) {
      fieldsMap = ["name": name, "full_name": full_name, "description": description]
    }

    public init(name: String, full_name: String, description: String?, html_url: String) {
      fieldsMap = ["name": name, "full_name": full_name, "description": description, "html_url": html_url]
    }

    public init(name: String, full_name: String, description: String?, html_url: String, stargazers_count: Int) {
      fieldsMap = ["name": name, "full_name": full_name, "description": description, "html_url": html_url, "stargazers_count": stargazers_count]
    }

    public init(name: String, full_name: String, description: String?, html_url: String, stargazers_count: Int, open_issues_count: Int?) {
      fieldsMap = ["name": name, "full_name": full_name, "description": description, "html_url": html_url, "stargazers_count": stargazers_count, "open_issues_count": open_issues_count]
    }

}

public struct User: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

    public init() {
      fieldsMap = []
    }

    public init(login: String) {
      fieldsMap = ["login": login]
    }

    public init(login: String, avatar_url: String) {
      fieldsMap = ["login": login, "avatar_url": avatar_url]
    }

}

public struct Comment: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

    public init() {
      fieldsMap = []
    }

    public init(id: Int) {
      fieldsMap = ["id": id]
    }

    public init(id: Int, postedBy: User) {
      fieldsMap = ["id": id, "postedBy": postedBy]
    }

    public init(id: Int, postedBy: User, createdAt: Float) {
      fieldsMap = ["id": id, "postedBy": postedBy, "createdAt": createdAt]
    }

    public init(id: Int, postedBy: User, createdAt: Float, content: String) {
      fieldsMap = ["id": id, "postedBy": postedBy, "createdAt": createdAt, "content": content]
    }

}

public struct Vote: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

    public init() {
      fieldsMap = []
    }

}

public struct A: GraphQLMapConvertible {
  public var fieldsMap: GraphQLMap

    public init() {
      fieldsMap = []
    }

}

public enum VoteType: String {
    case UP = "UP"
    case DOWN = "DOWN"
    case CANCEL = "CANCEL"
}

public struct OnCommentAddedSubscription {
    public struct Variables {
      public let repoFullName: String
    }

    public struct CommentAdded {
      public let id: Int
      public let postedBy: PostedBy
      public let createdAt: Float
      public let content: String
    }

    public struct PostedBy {
      public let login: String
      public let html_url: String
    }

    public struct Result {
      public let commentAdded: CommentAdded?
    }

}

public struct CommentQuery {
    public struct Variables {
      public let repoFullName: String
      public let limit: Int?
      public let offset: Int?
    }

    public struct CurrentUser {
      public let login: String
      public let html_url: String
    }

    public struct Result {
      public let currentUser: CurrentUser?
      public let entry: Entry?
    }

    public struct Entry {
      public let id: Int
      public let postedBy: PostedBy
      public let createdAt: Float
      public let comments: [Comments]
      public let commentCount: Int
      public let repository: Repository
    }

    public struct PostedBy {
      public let login: String
      public let html_url: String
    }

    public struct Comments {
    }

    public struct Repository {
      public let full_name: String
      public let html_url: String
      public let description: String?
      public let open_issues_count: Int?
      public let stargazers_count: Int
    }

}

public struct CommentsPageComment {
    public struct Fragment {
      public let id: Int
      public let postedBy: PostedBy
      public let createdAt: Float
      public let content: String
    }

    public struct PostedBy {
      public let login: String
      public let html_url: String
    }

}

public struct CurrentUserForProfileQuery {
    public struct CurrentUser {
      public let login: String
      public let avatar_url: String
    }

    public struct Result {
      public let currentUser: CurrentUser?
    }

}

public struct FeedEntry {
    public struct Fragment {
      public let id: Int
      public let commentCount: Int
      public let repository: Repository
    }

    public struct Repository {
      public let full_name: String
      public let html_url: String
      public let owner: Owner?
    }

    public struct Owner {
      public let avatar_url: String
    }

}

public struct FeedQuery {
    public struct Variables {
      public let type: FeedType
      public let offset: Int?
      public let limit: Int?
    }

    public struct CurrentUser {
      public let login: String
    }

    public struct Result {
      public let currentUser: CurrentUser?
      public let feed: [Feed]?
    }

    public struct Feed {
    }

}

public struct SubmitRepositoryMutation {
    public struct Variables {
      public let repoFullName: String
    }

    public struct SubmitRepository {
      public let createdAt: Float
    }

    public struct Result {
      public let submitRepository: SubmitRepository?
    }

}

public struct RepoInfo {
    public struct Fragment {
      public let createdAt: Float
      public let repository: Repository
      public let postedBy: PostedBy
    }

    public struct Repository {
      public let description: String?
      public let stargazers_count: Int
      public let open_issues_count: Int?
    }

    public struct PostedBy {
      public let html_url: String
      public let login: String
    }

}

public struct SubmitCommentMutation {
    public struct Variables {
      public let repoFullName: String
      public let commentContent: String
    }

    public struct SubmitComment {
    }

    public struct Result {
      public let submitComment: SubmitComment?
    }

}

public struct VoteButtons {
    public struct Fragment {
      public let score: Int
      public let vote: Vote
    }

    public struct Vote {
      public let vote_value: Int
    }

}

public struct VoteMutation {
    public struct Variables {
      public let repoFullName: String
      public let type: VoteType
    }

    public struct Vote {
      public let score: Int
      public let id: Int
      public let vote: _Vote
    }

    public struct _Vote {
      public let vote_value: Int
    }

    public struct Result {
      public let vote: Vote?
    }

}

