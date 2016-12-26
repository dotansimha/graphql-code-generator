import Apollo

public enum FeedType: String {
  case HOT = "HOT" /// Sort by a combination of freshness and score, using Reddit&#x27;s algorithm
  case NEW = "NEW" /// Newest entries first
  case TOP = "TOP" /// Highest score entries first
}

extension FeedType: JSONDecodable, JSONEncodable {}

public struct Entry: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(repository: Repository, postedBy: User, createdAt: Float, score: Int, hotScore: Float, comments: [Comment], commentCount: Int, id: Int, vote: Vote) {
    graphQLMap = ["repository": repository, "postedBy": postedBy, "createdAt": createdAt, "score": score, "hotScore": hotScore, "comments": comments, "commentCount": commentCount, "id": id, "vote": vote]
  }
}

public struct Repository: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(name: String, full_name: String, description: String? = nil, html_url: String, stargazers_count: Int, open_issues_count: Int? = nil, owner: User? = nil) {
    graphQLMap = ["name": name, "full_name": full_name, "description": description, "html_url": html_url, "stargazers_count": stargazers_count, "open_issues_count": open_issues_count, "owner": owner]
  }
}

public struct User: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(login: String, avatar_url: String, html_url: String) {
    graphQLMap = ["login": login, "avatar_url": avatar_url, "html_url": html_url]
  }
}

public struct Comment: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: Int, postedBy: User, createdAt: Float, content: String, repoName: String) {
    graphQLMap = ["id": id, "postedBy": postedBy, "createdAt": createdAt, "content": content, "repoName": repoName]
  }
}

public struct Vote: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(vote_value: Int) {
    graphQLMap = ["vote_value": vote_value]
  }
}

public enum VoteType: String {
  case UP = "UP" /// 
  case DOWN = "DOWN" /// 
  case CANCEL = "CANCEL" /// 
}

extension VoteType: JSONDecodable, JSONEncodable {}


public final class OnCommentAddedSubscription: GraphQLSubscription {
  public static let operationDefinition = "subscription onCommentAdded($repoFullName: String!) {" +
"  commentAdded(repoFullName: $repoFullName) {" +
"    id" +
"    postedBy {" +
"      login" +
"      html_url" +
"    }" +
"    createdAt" +
"    content" +
"  }" +
"}"
  
  public let repoFullName: String

  public var variables: GraphQLMap? {
    return ["repoFullName": repoFullName]
  }

  public init(repoFullName: String) {
    self.repoFullName = repoFullName
  }
  
  public struct Data: GraphQLMappable {
    
    public let commentAdded: CommentAdded?
  
    public init(reader: GraphQLResultReader) throws {
      commentAdded = try reader.optionalValue(for: Field(responseName: "commentAdded"))
    }
    
    public struct CommentAdded: GraphQLMappable {
      
      public let __typename: String
      public let id: Int
      public let postedBy: PostedBy
      public let createdAt: Float
      public let content: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        id = try reader.value(for: Field(responseName: "id"))
        postedBy = try reader.value(for: Field(responseName: "postedBy"))
        createdAt = try reader.value(for: Field(responseName: "createdAt"))
        content = try reader.value(for: Field(responseName: "content"))
      }
      
      public struct PostedBy: GraphQLMappable {
        
        public let __typename: String
        public let login: String
        public let html_url: String
      
        public init(reader: GraphQLResultReader) throws {
          __typename = try reader.value(for: Field(responseName: "__typename"))
          login = try reader.value(for: Field(responseName: "login"))
          html_url = try reader.value(for: Field(responseName: "html_url"))
        }
      }
    }
  }
}
public final class CommentQuery: GraphQLQuery {
  public static let operationDefinition = "query Comment($repoFullName: String!, $limit: Int, $offset: Int) {" +
"  currentUser {" +
"    login" +
"    html_url" +
"  }" +
"  entry(repoFullName: $repoFullName) {" +
"    id" +
"    postedBy {" +
"      login" +
"      html_url" +
"    }" +
"    createdAt" +
"    comments(limit: $limit, offset: $offset) {" +
"      ...CommentsPageComment" +
"    }" +
"    commentCount" +
"    repository {" +
"      full_name" +
"      html_url" +
"      ... on Repository {" +
"        description" +
"        open_issues_count" +
"        stargazers_count" +
"      }" +
"    }" +
"  }" +
"}"
  
  public let repoFullName: String
  public let limit: Int?
  public let offset: Int?

  public var variables: GraphQLMap? {
    return ["repoFullName": repoFullName, "limit": limit, "offset": offset]
  }

  public init(repoFullName: String, limit: Int?, offset: Int?) {
    self.repoFullName = repoFullName
    self.limit = limit
    self.offset = offset
  }
  
  public struct Data: GraphQLMappable {
    
    public let currentUser: CurrentUser?
    public let entry: Entry?
  
    public init(reader: GraphQLResultReader) throws {
      currentUser = try reader.optionalValue(for: Field(responseName: "currentUser"))
      entry = try reader.optionalValue(for: Field(responseName: "entry"))
    }
    
    public struct CurrentUser: GraphQLMappable {
      
      public let __typename: String
      public let login: String
      public let html_url: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        login = try reader.value(for: Field(responseName: "login"))
        html_url = try reader.value(for: Field(responseName: "html_url"))
      }
    }
    
    public struct Entry: GraphQLMappable {
      
      public let __typename: String
      public let id: Int
      public let postedBy: PostedBy
      public let createdAt: Float
      public let comments: [Comments?]
      public let commentCount: Int
      public let repository: Repository
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        id = try reader.value(for: Field(responseName: "id"))
        postedBy = try reader.value(for: Field(responseName: "postedBy"))
        createdAt = try reader.value(for: Field(responseName: "createdAt"))
        comments = try reader.list(for: Field(responseName: "comments"))
        commentCount = try reader.value(for: Field(responseName: "commentCount"))
        repository = try reader.value(for: Field(responseName: "repository"))
      }
      
      public struct PostedBy: GraphQLMappable {
        
        public let __typename: String
        public let login: String
        public let html_url: String
      
        public init(reader: GraphQLResultReader) throws {
          __typename = try reader.value(for: Field(responseName: "__typename"))
          login = try reader.value(for: Field(responseName: "login"))
          html_url = try reader.value(for: Field(responseName: "html_url"))
        }
      }
      
      public struct Comments: GraphQLMappable {
        
        public let __typename: String
        public let fragments: Fragments
      
        public init(reader: GraphQLResultReader) throws {
          __typename = try reader.value(for: Field(responseName: "__typename"))
          let commentsPageComment = try CommentsPageComment(reader: reader)
          fragments = Fragments(commentsPageComment: commentsPageComment)
        }
        public struct Fragments {
          public let commentsPageComment: CommentsPageComment
        }
      }
      
      public struct Repository: GraphQLMappable {
        
        public static let possibleTypes = ["Repository"]
        public let __typename: String
        public let full_name: String
        public let html_url: String
        public let asRepository: AsRepository?
      
        public init(reader: GraphQLResultReader) throws {
          __typename = try reader.value(for: Field(responseName: "__typename"))
          full_name = try reader.value(for: Field(responseName: "full_name"))
          html_url = try reader.value(for: Field(responseName: "html_url"))
          asRepository = try AsRepository(reader: reader, ifTypeMatches: __typename)
        }
        
        public struct AsRepository: GraphQLConditionalFragment {
          
          public static let possibleTypes = ["Repository"]
          public let __typename = "Repository"
          public let full_name: String
          public let html_url: String
          public let description: String?
          public let open_issues_count: Int?
          public let stargazers_count: Int
        
          public init(reader: GraphQLResultReader) throws {
            description = try reader.optionalValue(for: Field(responseName: "description"))
            open_issues_count = try reader.optionalValue(for: Field(responseName: "open_issues_count"))
            stargazers_count = try reader.value(for: Field(responseName: "stargazers_count"))
            full_name = try reader.value(for: Field(responseName: "full_name"))
            html_url = try reader.value(for: Field(responseName: "html_url"))
          }
        }
      }
    }
  }
}

public struct CommentsPageComment: GraphQLNamedFragment {
  public static let fragmentDefinition = "fragment CommentsPageComment on Comment {" +
"  id" +
"  postedBy {" +
"    login" +
"    html_url" +
"  }" +
"  createdAt" +
"  content" +
"}"
  public let __typename: String
  public let id: Int
  public let postedBy: PostedBy
  public let createdAt: Float
  public let content: String

  public init(reader: GraphQLResultReader) throws {
    __typename = try reader.value(for: Field(responseName: "__typename"))
    id = try reader.value(for: Field(responseName: "id"))
    postedBy = try reader.value(for: Field(responseName: "postedBy"))
    createdAt = try reader.value(for: Field(responseName: "createdAt"))
    content = try reader.value(for: Field(responseName: "content"))
  }
  
  public struct PostedBy: GraphQLMappable {
    
    public let __typename: String
    public let login: String
    public let html_url: String
  
    public init(reader: GraphQLResultReader) throws {
      __typename = try reader.value(for: Field(responseName: "__typename"))
      login = try reader.value(for: Field(responseName: "login"))
      html_url = try reader.value(for: Field(responseName: "html_url"))
    }
  }
}
public final class CurrentUserForProfileQuery: GraphQLQuery {
  public static let operationDefinition = "query CurrentUserForProfile {" +
"  currentUser {" +
"    login" +
"    avatar_url" +
"  }" +
"}"
  
  public init() {
  }
  
  public struct Data: GraphQLMappable {
    
    public let currentUser: CurrentUser?
  
    public init(reader: GraphQLResultReader) throws {
      currentUser = try reader.optionalValue(for: Field(responseName: "currentUser"))
    }
    
    public struct CurrentUser: GraphQLMappable {
      
      public let __typename: String
      public let login: String
      public let avatar_url: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        login = try reader.value(for: Field(responseName: "login"))
        avatar_url = try reader.value(for: Field(responseName: "avatar_url"))
      }
    }
  }
}

public struct FeedEntry: GraphQLNamedFragment {
  public static let fragmentDefinition = "fragment FeedEntry on Entry {" +
"  id" +
"  commentCount" +
"  repository {" +
"    full_name" +
"    html_url" +
"    owner {" +
"      avatar_url" +
"    }" +
"  }" +
"  ...VoteButtons" +
"  ...RepoInfo" +
"}"
  public let __typename: String
  public let fragments: Fragments
  public let id: Int
  public let commentCount: Int
  public let repository: Repository

  public init(reader: GraphQLResultReader) throws {
    __typename = try reader.value(for: Field(responseName: "__typename"))
    id = try reader.value(for: Field(responseName: "id"))
    commentCount = try reader.value(for: Field(responseName: "commentCount"))
    repository = try reader.value(for: Field(responseName: "repository"))
    let voteButtons = try VoteButtons(reader: reader)
    let repoInfo = try RepoInfo(reader: reader)
    fragments = Fragments(voteButtons: voteButtonsrepoInfo: repoInfo)
  }
  public struct Fragments {
    public let voteButtons: VoteButtons
    public let repoInfo: RepoInfo
  }
  
  public struct Repository: GraphQLMappable {
    
    public let __typename: String
    public let full_name: String
    public let html_url: String
    public let owner: Owner?
  
    public init(reader: GraphQLResultReader) throws {
      __typename = try reader.value(for: Field(responseName: "__typename"))
      full_name = try reader.value(for: Field(responseName: "full_name"))
      html_url = try reader.value(for: Field(responseName: "html_url"))
      owner = try reader.optionalValue(for: Field(responseName: "owner"))
    }
    
    public struct Owner: GraphQLMappable {
      
      public let __typename: String
      public let avatar_url: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        avatar_url = try reader.value(for: Field(responseName: "avatar_url"))
      }
    }
  }
}
public final class FeedQuery: GraphQLQuery {
  public static let operationDefinition = "query Feed($type: FeedType!, $offset: Int, $limit: Int) {" +
"  currentUser {" +
"    login" +
"  }" +
"  feed(type: $type, offset: $offset, limit: $limit) {" +
"    ...FeedEntry" +
"  }" +
"}"
  
  public let type: FeedType
  public let offset: Int?
  public let limit: Int?

  public var variables: GraphQLMap? {
    return ["type": type, "offset": offset, "limit": limit]
  }

  public init(type: FeedType, offset: Int?, limit: Int?) {
    self.type = type
    self.offset = offset
    self.limit = limit
  }
  
  public struct Data: GraphQLMappable {
    
    public let currentUser: CurrentUser?
    public let feed: [Feed?]?
  
    public init(reader: GraphQLResultReader) throws {
      currentUser = try reader.optionalValue(for: Field(responseName: "currentUser"))
      feed = try reader.optionalList(for: Field(responseName: "feed"))
    }
    
    public struct CurrentUser: GraphQLMappable {
      
      public let __typename: String
      public let login: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        login = try reader.value(for: Field(responseName: "login"))
      }
    }
    
    public struct Feed: GraphQLMappable {
      
      public let __typename: String
      public let fragments: Fragments
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        let feedEntry = try FeedEntry(reader: reader)
        fragments = Fragments(feedEntry: feedEntry)
      }
      public struct Fragments {
        public let feedEntry: FeedEntry
      }
    }
  }
}
public final class SubmitRepositoryMutation: GraphQLMutation {
  public static let operationDefinition = "mutation submitRepository($repoFullName: String!) {" +
"  submitRepository(repoFullName: $repoFullName) {" +
"    createdAt" +
"  }" +
"}"
  
  public let repoFullName: String

  public var variables: GraphQLMap? {
    return ["repoFullName": repoFullName]
  }

  public init(repoFullName: String) {
    self.repoFullName = repoFullName
  }
  
  public struct Data: GraphQLMappable {
    
    public let submitRepository: SubmitRepository?
  
    public init(reader: GraphQLResultReader) throws {
      submitRepository = try reader.optionalValue(for: Field(responseName: "submitRepository"))
    }
    
    public struct SubmitRepository: GraphQLMappable {
      
      public let __typename: String
      public let createdAt: Float
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        createdAt = try reader.value(for: Field(responseName: "createdAt"))
      }
    }
  }
}

public struct RepoInfo: GraphQLNamedFragment {
  public static let fragmentDefinition = "fragment RepoInfo on Entry {" +
"  createdAt" +
"  repository {" +
"    description" +
"    stargazers_count" +
"    open_issues_count" +
"  }" +
"  postedBy {" +
"    html_url" +
"    login" +
"  }" +
"}"
  public let __typename: String
  public let createdAt: Float
  public let repository: Repository
  public let postedBy: PostedBy

  public init(reader: GraphQLResultReader) throws {
    __typename = try reader.value(for: Field(responseName: "__typename"))
    createdAt = try reader.value(for: Field(responseName: "createdAt"))
    repository = try reader.value(for: Field(responseName: "repository"))
    postedBy = try reader.value(for: Field(responseName: "postedBy"))
  }
  
  public struct Repository: GraphQLMappable {
    
    public let __typename: String
    public let description: String?
    public let stargazers_count: Int
    public let open_issues_count: Int?
  
    public init(reader: GraphQLResultReader) throws {
      __typename = try reader.value(for: Field(responseName: "__typename"))
      description = try reader.optionalValue(for: Field(responseName: "description"))
      stargazers_count = try reader.value(for: Field(responseName: "stargazers_count"))
      open_issues_count = try reader.optionalValue(for: Field(responseName: "open_issues_count"))
    }
  }
  
  public struct PostedBy: GraphQLMappable {
    
    public let __typename: String
    public let html_url: String
    public let login: String
  
    public init(reader: GraphQLResultReader) throws {
      __typename = try reader.value(for: Field(responseName: "__typename"))
      html_url = try reader.value(for: Field(responseName: "html_url"))
      login = try reader.value(for: Field(responseName: "login"))
    }
  }
}
public final class SubmitCommentMutation: GraphQLMutation {
  public static let operationDefinition = "mutation submitComment($repoFullName: String!, $commentContent: String!) {" +
"  submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {" +
"    ...CommentsPageComment" +
"  }" +
"}"
  
  public let repoFullName: String
  public let commentContent: String

  public var variables: GraphQLMap? {
    return ["repoFullName": repoFullName, "commentContent": commentContent]
  }

  public init(repoFullName: String, commentContent: String) {
    self.repoFullName = repoFullName
    self.commentContent = commentContent
  }
  
  public struct Data: GraphQLMappable {
    
    public let submitComment: SubmitComment?
  
    public init(reader: GraphQLResultReader) throws {
      submitComment = try reader.optionalValue(for: Field(responseName: "submitComment"))
    }
    
    public struct SubmitComment: GraphQLMappable {
      
      public let __typename: String
      public let fragments: Fragments
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        let commentsPageComment = try CommentsPageComment(reader: reader)
        fragments = Fragments(commentsPageComment: commentsPageComment)
      }
      public struct Fragments {
        public let commentsPageComment: CommentsPageComment
      }
    }
  }
}

public struct VoteButtons: GraphQLNamedFragment {
  public static let fragmentDefinition = "fragment VoteButtons on Entry {" +
"  score" +
"  vote {" +
"    vote_value" +
"  }" +
"}"
  public let __typename: String
  public let score: Int
  public let vote: Vote

  public init(reader: GraphQLResultReader) throws {
    __typename = try reader.value(for: Field(responseName: "__typename"))
    score = try reader.value(for: Field(responseName: "score"))
    vote = try reader.value(for: Field(responseName: "vote"))
  }
  
  public struct Vote: GraphQLMappable {
    
    public let __typename: String
    public let vote_value: Int
  
    public init(reader: GraphQLResultReader) throws {
      __typename = try reader.value(for: Field(responseName: "__typename"))
      vote_value = try reader.value(for: Field(responseName: "vote_value"))
    }
  }
}
public final class VoteMutation: GraphQLMutation {
  public static let operationDefinition = "mutation vote($repoFullName: String!, $type: VoteType!) {" +
"  vote(repoFullName: $repoFullName, type: $type) {" +
"    score" +
"    id" +
"    vote {" +
"      vote_value" +
"    }" +
"  }" +
"}"
  
  public let repoFullName: String
  public let type: VoteType

  public var variables: GraphQLMap? {
    return ["repoFullName": repoFullName, "type": type]
  }

  public init(repoFullName: String, type: VoteType) {
    self.repoFullName = repoFullName
    self.type = type
  }
  
  public struct Data: GraphQLMappable {
    
    public let vote: Vote?
  
    public init(reader: GraphQLResultReader) throws {
      vote = try reader.optionalValue(for: Field(responseName: "vote"))
    }
    
    public struct Vote: GraphQLMappable {
      
      public let __typename: String
      public let score: Int
      public let id: Int
      public let vote: _Vote
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        score = try reader.value(for: Field(responseName: "score"))
        id = try reader.value(for: Field(responseName: "id"))
        vote = try reader.value(for: Field(responseName: "vote"))
      }
      
      public struct _Vote: GraphQLMappable {
        
        public let __typename: String
        public let vote_value: Int
      
        public init(reader: GraphQLResultReader) throws {
          __typename = try reader.value(for: Field(responseName: "__typename"))
          vote_value = try reader.value(for: Field(responseName: "vote_value"))
        }
      }
    }
  }
}

