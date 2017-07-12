import Apollo

public struct Query: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(hero: Character? = nil, reviews: [Review]? = nil, search: [SearchResult]? = nil, character: Character? = nil, droid: Droid? = nil, human: Human? = nil, starship: Starship? = nil) {
    graphQLMap = ["hero": hero, "reviews": reviews, "search": search, "character": character, "droid": droid, "human": human, "starship": starship]
  }
}

public struct HeroQuery: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(episode: Episode? = nil) {
    graphQLMap = ["episode": episode]
  }
}

public struct ReviewsQuery: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(episode: Episode) {
    graphQLMap = ["episode": episode]
  }
}

public struct SearchQuery: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(text: String? = nil) {
    graphQLMap = ["text": text]
  }
}

public struct CharacterQuery: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String) {
    graphQLMap = ["id": id]
  }
}

public struct DroidQuery: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String) {
    graphQLMap = ["id": id]
  }
}

public struct HumanQuery: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String) {
    graphQLMap = ["id": id]
  }
}

public struct StarshipQuery: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String) {
    graphQLMap = ["id": id]
  }
}

public enum Episode: String {
  case NEWHOPE = "NEWHOPE" /// Star Wars Episode IV: A New Hope, released in 1977.
  case EMPIRE = "EMPIRE" /// Star Wars Episode V: The Empire Strikes Back, released in 1980.
  case JEDI = "JEDI" /// Star Wars Episode VI: Return of the Jedi, released in 1983.
}

extension Episode: JSONDecodable, JSONEncodable {}

public struct Character: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String, name: String, friends: [Character]? = nil, friendsConnection: FriendsConnection, appearsIn: [Episode]) {
    graphQLMap = ["id": id, "name": name, "friends": friends, "friendsConnection": friendsConnection, "appearsIn": appearsIn]
  }
}

public struct FriendsConnectionCharacter: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(first: Int? = nil, after: String? = nil) {
    graphQLMap = ["first": first, "after": after]
  }
}

public struct FriendsConnection: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(totalCount: Int? = nil, edges: [FriendsEdge]? = nil, friends: [Character]? = nil, pageInfo: PageInfo) {
    graphQLMap = ["totalCount": totalCount, "edges": edges, "friends": friends, "pageInfo": pageInfo]
  }
}

public struct FriendsEdge: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(cursor: String, node: Character? = nil) {
    graphQLMap = ["cursor": cursor, "node": node]
  }
}

public struct PageInfo: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(startCursor: String? = nil, endCursor: String? = nil, hasNextPage: Bool) {
    graphQLMap = ["startCursor": startCursor, "endCursor": endCursor, "hasNextPage": hasNextPage]
  }
}

public struct Review: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(stars: Int, commentary: String? = nil) {
    graphQLMap = ["stars": stars, "commentary": commentary]
  }
}

public struct Human: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String, name: String, homePlanet: String? = nil, height: Float? = nil, mass: Float? = nil, friends: [Character]? = nil, friendsConnection: FriendsConnection, appearsIn: [Episode], starships: [Starship]? = nil) {
    graphQLMap = ["id": id, "name": name, "homePlanet": homePlanet, "height": height, "mass": mass, "friends": friends, "friendsConnection": friendsConnection, "appearsIn": appearsIn, "starships": starships]
  }
}

public struct HeightHuman: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(unit: LengthUnit? = nil) {
    graphQLMap = ["unit": unit]
  }
}

public struct FriendsConnectionHuman: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(first: Int? = nil, after: String? = nil) {
    graphQLMap = ["first": first, "after": after]
  }
}

public enum LengthUnit: String {
  case METER = "METER" /// The standard unit around the world
  case FOOT = "FOOT" /// Primarily used in the United States
}

extension LengthUnit: JSONDecodable, JSONEncodable {}

public struct Starship: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String, name: String, length: Float? = nil) {
    graphQLMap = ["id": id, "name": name, "length": length]
  }
}

public struct LengthStarship: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(unit: LengthUnit? = nil) {
    graphQLMap = ["unit": unit]
  }
}

public struct Droid: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(id: String, name: String, friends: [Character]? = nil, friendsConnection: FriendsConnection, appearsIn: [Episode], primaryFunction: String? = nil) {
    graphQLMap = ["id": id, "name": name, "friends": friends, "friendsConnection": friendsConnection, "appearsIn": appearsIn, "primaryFunction": primaryFunction]
  }
}

public struct FriendsConnectionDroid: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(first: Int? = nil, after: String? = nil) {
    graphQLMap = ["first": first, "after": after]
  }
}

public struct Mutation: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(createReview: Review? = nil) {
    graphQLMap = ["createReview": createReview]
  }
}

public struct CreateReviewMutation: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(episode: Episode? = nil, review: ReviewInput) {
    graphQLMap = ["episode": episode, "review": review]
  }
}

public struct ReviewInput: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(stars: Int, commentary: String? = nil, favoriteColor: ColorInput? = nil) {
    graphQLMap = ["stars": stars, "commentary": commentary, "favoriteColor": favoriteColor]
  }
}

public struct ColorInput: GraphQLMapConvertible {
  public var graphQLMap: GraphQLMap

  public init(red: Int, green: Int, blue: Int) {
    graphQLMap = ["red": red, "green": green, "blue": blue]
  }
}


public final class CreateReviewForEpisodeMutation: GraphQLMutation {
  public static let operationDefinition = "mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {" +
"  createReview(episode: $episode, review: $review) {" +
"    stars" +
"    commentary" +
"  }" +
"}"
  
  public let episode: Episode
  public let review: ReviewInput

  public var variables: GraphQLMap? {
    return ["episode": episode, "review": review]
  }

  public init(episode: Episode, review: ReviewInput) {
    self.episode = episode
    self.review = review
  }
  
  public struct Data: GraphQLMappable {
    
    public let createReview: CreateReview?
  
    public init(reader: GraphQLResultReader) throws {
      createReview = try reader.optionalValue(for: Field(responseName: "createReview"))
    }
    
    public struct CreateReview: GraphQLMappable {
      
      public let __typename: String
      public let stars: Int
      public let commentary: String?
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        stars = try reader.value(for: Field(responseName: "stars"))
        commentary = try reader.optionalValue(for: Field(responseName: "commentary"))
      }
    }
  }
}
public final class HeroAndFriendsNamesQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroAndFriendsNames($episode: Episode) {" +
"  hero(episode: $episode) {" +
"    name" +
"    friends {" +
"      name" +
"    }" +
"  }" +
"}"
  
  public let episode: Episode?

  public var variables: GraphQLMap? {
    return ["episode": episode]
  }

  public init(episode: Episode?) {
    self.episode = episode
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public let __typename: String
      public let name: String
      public let friends: [Friends?]?
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
        friends = try reader.optionalList(for: Field(responseName: "friends"))
      }
      
      public struct Friends: GraphQLMappable {
        
        public let __typename: String
        public let name: String
      
        public init(reader: GraphQLResultReader) throws {
          __typename = try reader.value(for: Field(responseName: "__typename"))
          name = try reader.value(for: Field(responseName: "name"))
        }
      }
    }
  }
}
public final class HeroAppearsInQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroAppearsIn {" +
"  hero {" +
"    name" +
"    appearsIn" +
"  }" +
"}"
  
  public init() {
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public let __typename: String
      public let name: String
      public let appearsIn: [Episode?]
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
        appearsIn = try reader.list(for: Field(responseName: "appearsIn"))
      }
    }
  }
}
public final class HeroDetailsQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroDetails($episode: Episode) {" +
"  hero(episode: $episode) {" +
"    name" +
"    ... on Human {" +
"      height" +
"    }" +
"    ... on Droid {" +
"      primaryFunction" +
"    }" +
"  }" +
"}"
  
  public let episode: Episode?

  public var variables: GraphQLMap? {
    return ["episode": episode]
  }

  public init(episode: Episode?) {
    self.episode = episode
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public static let possibleTypes = ["Human", "Droid"]
      public let __typename: String
      public let name: String
      public let asHuman: AsHuman?
      public let asDroid: AsDroid?
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
        asHuman = try AsHuman(reader: reader, ifTypeMatches: __typename)
        asDroid = try AsDroid(reader: reader, ifTypeMatches: __typename)
      }
      
      public struct AsHuman: GraphQLConditionalFragment {
        
        public static let possibleTypes = ["Human"]
        public let __typename = "Human"
        public let name: String
        public let height: Float?
      
        public init(reader: GraphQLResultReader) throws {
          height = try reader.optionalValue(for: Field(responseName: "height"))
          name = try reader.value(for: Field(responseName: "name"))
        }
      }
      
      public struct AsDroid: GraphQLConditionalFragment {
        
        public static let possibleTypes = ["Droid"]
        public let __typename = "Droid"
        public let name: String
        public let primaryFunction: String?
      
        public init(reader: GraphQLResultReader) throws {
          primaryFunction = try reader.optionalValue(for: Field(responseName: "primaryFunction"))
          name = try reader.value(for: Field(responseName: "name"))
        }
      }
    }
  }
}
public final class HeroDetailsWithFragmentQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroDetailsWithFragment($episode: Episode) {" +
"  hero(episode: $episode) {" +
"    ...HeroDetails" +
"  }" +
"}"
  
  public let episode: Episode?

  public var variables: GraphQLMap? {
    return ["episode": episode]
  }

  public init(episode: Episode?) {
    self.episode = episode
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public let __typename: String
      public let fragments: Fragments
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        let heroDetails = try HeroDetails(reader: reader)
        fragments = Fragments(heroDetails: heroDetails)
      }
      public struct Fragments {
        public let heroDetails: HeroDetails
      }
    }
  }
}

public struct HeroDetails: GraphQLNamedFragment {
  public static let fragmentDefinition = "fragment HeroDetails on Character {" +
"  name" +
"  ... on Human {" +
"    height" +
"  }" +
"  ... on Droid {" +
"    primaryFunction" +
"  }" +
"}"
  public static let possibleTypes = ["Human", "Droid"]
  public let __typename: String
  public let name: String
  public let asHuman: AsHuman?
  public let asDroid: AsDroid?

  public init(reader: GraphQLResultReader) throws {
    __typename = try reader.value(for: Field(responseName: "__typename"))
    name = try reader.value(for: Field(responseName: "name"))
    asHuman = try AsHuman(reader: reader, ifTypeMatches: __typename)
    asDroid = try AsDroid(reader: reader, ifTypeMatches: __typename)
  }
  
  public struct AsHuman: GraphQLConditionalFragment {
    
    public static let possibleTypes = ["Human"]
    public let __typename = "Human"
    public let name: String
    public let height: Float?
  
    public init(reader: GraphQLResultReader) throws {
      height = try reader.optionalValue(for: Field(responseName: "height"))
      name = try reader.value(for: Field(responseName: "name"))
    }
  }
  
  public struct AsDroid: GraphQLConditionalFragment {
    
    public static let possibleTypes = ["Droid"]
    public let __typename = "Droid"
    public let name: String
    public let primaryFunction: String?
  
    public init(reader: GraphQLResultReader) throws {
      primaryFunction = try reader.optionalValue(for: Field(responseName: "primaryFunction"))
      name = try reader.value(for: Field(responseName: "name"))
    }
  }
}
public final class HeroNameQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroName($episode: Episode) {" +
"  hero(episode: $episode) {" +
"    name" +
"  }" +
"}"
  
  public let episode: Episode?

  public var variables: GraphQLMap? {
    return ["episode": episode]
  }

  public init(episode: Episode?) {
    self.episode = episode
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public let __typename: String
      public let name: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
      }
    }
  }
}
public final class HeroNameConditionalInclusionQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroNameConditionalInclusion($episode: Episode, $includeName: Boolean!) {" +
"  hero(episode: $episode) {" +
"    name @include(if: $includeName)" +
"  }" +
"}"
  
  public let episode: Episode?
  public let includeName: Bool

  public var variables: GraphQLMap? {
    return ["episode": episode, "includeName": includeName]
  }

  public init(episode: Episode?, includeName: Bool) {
    self.episode = episode
    self.includeName = includeName
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public let __typename: String
      public let name: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
      }
    }
  }
}
public final class HeroNameConditionalExclusionQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroNameConditionalExclusion($episode: Episode, $skipName: Boolean!) {" +
"  hero(episode: $episode) {" +
"    name @skip(if: $skipName)" +
"  }" +
"}"
  
  public let episode: Episode?
  public let skipName: Bool

  public var variables: GraphQLMap? {
    return ["episode": episode, "skipName": skipName]
  }

  public init(episode: Episode?, skipName: Bool) {
    self.episode = episode
    self.skipName = skipName
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public let __typename: String
      public let name: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
      }
    }
  }
}
public final class HeroParentTypeDependentFieldQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroParentTypeDependentField($episode: Episode) {" +
"  hero(episode: $episode) {" +
"    name" +
"    ... on Human {" +
"      friends {" +
"        name" +
"        ... on Human {" +
"          height(unit: FOOT)" +
"        }" +
"      }" +
"    }" +
"    ... on Droid {" +
"      friends {" +
"        name" +
"        ... on Human {" +
"          height(unit: METER)" +
"        }" +
"      }" +
"    }" +
"  }" +
"}"
  
  public let episode: Episode?

  public var variables: GraphQLMap? {
    return ["episode": episode]
  }

  public init(episode: Episode?) {
    self.episode = episode
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public static let possibleTypes = ["Human", "Droid"]
      public let __typename: String
      public let name: String
      public let asHuman: AsHuman?
      public let asDroid: AsDroid?
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
        asHuman = try AsHuman(reader: reader, ifTypeMatches: __typename)
        asDroid = try AsDroid(reader: reader, ifTypeMatches: __typename)
      }
      
      public struct AsHuman: GraphQLConditionalFragment {
        
        public static let possibleTypes = ["Human"]
        public let __typename = "Human"
        public let name: String
        public let friends: [Friends?]?
      
        public init(reader: GraphQLResultReader) throws {
          friends = try reader.optionalList(for: Field(responseName: "friends"))
          name = try reader.value(for: Field(responseName: "name"))
        }
        
        public struct Friends: GraphQLMappable {
          
          public static let possibleTypes = ["Human"]
          public let __typename: String
          public let name: String
          public let asHuman: AsHuman?
        
          public init(reader: GraphQLResultReader) throws {
            __typename = try reader.value(for: Field(responseName: "__typename"))
            name = try reader.value(for: Field(responseName: "name"))
            asHuman = try AsHuman(reader: reader, ifTypeMatches: __typename)
          }
          
          public struct AsHuman: GraphQLConditionalFragment {
            
            public static let possibleTypes = ["Human"]
            public let __typename = "Human"
            public let name: String
            public let height: Float?
          
            public init(reader: GraphQLResultReader) throws {
              height = try reader.optionalValue(for: Field(responseName: "height"))
              name = try reader.value(for: Field(responseName: "name"))
            }
          }
        }
      }
      
      public struct AsDroid: GraphQLConditionalFragment {
        
        public static let possibleTypes = ["Droid"]
        public let __typename = "Droid"
        public let name: String
        public let friends: [Friends?]?
      
        public init(reader: GraphQLResultReader) throws {
          friends = try reader.optionalList(for: Field(responseName: "friends"))
          name = try reader.value(for: Field(responseName: "name"))
        }
        
        public struct Friends: GraphQLMappable {
          
          public static let possibleTypes = ["Human"]
          public let __typename: String
          public let name: String
          public let asHuman: AsHuman?
        
          public init(reader: GraphQLResultReader) throws {
            __typename = try reader.value(for: Field(responseName: "__typename"))
            name = try reader.value(for: Field(responseName: "name"))
            asHuman = try AsHuman(reader: reader, ifTypeMatches: __typename)
          }
          
          public struct AsHuman: GraphQLConditionalFragment {
            
            public static let possibleTypes = ["Human"]
            public let __typename = "Human"
            public let name: String
            public let height: Float?
          
            public init(reader: GraphQLResultReader) throws {
              height = try reader.optionalValue(for: Field(responseName: "height"))
              name = try reader.value(for: Field(responseName: "name"))
            }
          }
        }
      }
    }
  }
}
public final class HeroTypeDependentAliasedFieldQuery: GraphQLQuery {
  public static let operationDefinition = "query HeroTypeDependentAliasedField($episode: Episode) {" +
"  hero(episode: $episode) {" +
"    ... on Human {" +
"      property: homePlanet" +
"    }" +
"    ... on Droid {" +
"      property: primaryFunction" +
"    }" +
"  }" +
"}"
  
  public let episode: Episode?

  public var variables: GraphQLMap? {
    return ["episode": episode]
  }

  public init(episode: Episode?) {
    self.episode = episode
  }
  
  public struct Data: GraphQLMappable {
    
    public let hero: Hero?
  
    public init(reader: GraphQLResultReader) throws {
      hero = try reader.optionalValue(for: Field(responseName: "hero"))
    }
    
    public struct Hero: GraphQLMappable {
      
      public static let possibleTypes = ["Human", "Droid"]
      public let __typename: String
      public let asHuman: AsHuman?
      public let asDroid: AsDroid?
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        asHuman = try AsHuman(reader: reader, ifTypeMatches: __typename)
        asDroid = try AsDroid(reader: reader, ifTypeMatches: __typename)
      }
      
      public struct AsHuman: GraphQLConditionalFragment {
        
        public static let possibleTypes = ["Human"]
        public let __typename = "Human"
        public let property: String?
      
        public init(reader: GraphQLResultReader) throws {
          property = try reader.optionalValue(for: Field(responseName: "property", fieldName: "homePlanet"))
        }
      }
      
      public struct AsDroid: GraphQLConditionalFragment {
        
        public static let possibleTypes = ["Droid"]
        public let __typename = "Droid"
        public let property: String?
      
        public init(reader: GraphQLResultReader) throws {
          property = try reader.optionalValue(for: Field(responseName: "property", fieldName: "primaryFunction"))
        }
      }
    }
  }
}
public final class HumanWithNullHeightQuery: GraphQLQuery {
  public static let operationDefinition = "query HumanWithNullHeight {" +
"  human(id: 1004) {" +
"    name" +
"    mass" +
"  }" +
"}"
  
  public init() {
  }
  
  public struct Data: GraphQLMappable {
    
    public let human: Human?
  
    public init(reader: GraphQLResultReader) throws {
      human = try reader.optionalValue(for: Field(responseName: "human"))
    }
    
    public struct Human: GraphQLMappable {
      
      public let __typename: String
      public let name: String
      public let mass: Float?
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
        mass = try reader.optionalValue(for: Field(responseName: "mass"))
      }
    }
  }
}
public final class TwoHeroesQuery: GraphQLQuery {
  public static let operationDefinition = "query TwoHeroes {" +
"  r2: hero {" +
"    name" +
"  }" +
"  luke: hero(episode: EMPIRE) {" +
"    name" +
"  }" +
"}"
  
  public init() {
  }
  
  public struct Data: GraphQLMappable {
    
    public let r2: R2_Hero?
    public let luke: Luke_Hero?
  
    public init(reader: GraphQLResultReader) throws {
      r2 = try reader.optionalValue(for: Field(responseName: "r2", fieldName: "hero"))
      luke = try reader.optionalValue(for: Field(responseName: "luke", fieldName: "hero"))
    }
    
    public struct R2_Hero: GraphQLMappable {
      
      public let __typename: String
      public let name: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
      }
    }
    
    public struct Luke_Hero: GraphQLMappable {
      
      public let __typename: String
      public let name: String
    
      public init(reader: GraphQLResultReader) throws {
        __typename = try reader.value(for: Field(responseName: "__typename"))
        name = try reader.value(for: Field(responseName: "name"))
      }
    }
  }
}

