from typing import Optional, List, Literal, Union, Any
from enum import Enum
class Scalars:
  ID = Union[str]
  String = Union[str]
  Boolean = Union[bool]
  Int = Union[int]
  Float = Union[float]

# The query type, represents all of the entry points into our object graph
class Query:
  __typename: Optional[Literal["Query"]]
  hero: Optional["__GQL_CODEGEN_Character__"]
  reviews: Optional[List[Optional["__GQL_CODEGEN_Review__"]]]
  search: Optional[List[Optional["__GQL_CODEGEN_SearchResult__"]]]
  character: Optional["__GQL_CODEGEN_Character__"]
  droid: Optional["__GQL_CODEGEN_Droid__"]
  human: Optional["__GQL_CODEGEN_Human__"]
  starship: Optional["__GQL_CODEGEN_Starship__"]

__GQL_CODEGEN_Query__ = Query


# The query type, represents all of the entry points into our object graph
class QueryHeroArgs:
  episode: Optional[Episode]

__GQL_CODEGEN_QueryHeroArgs__ = QueryHeroArgs


# The query type, represents all of the entry points into our object graph
class QueryReviewsArgs:
  episode: Episode

__GQL_CODEGEN_QueryReviewsArgs__ = QueryReviewsArgs


# The query type, represents all of the entry points into our object graph
class QuerySearchArgs:
  text: Optional[Scalars.String]

__GQL_CODEGEN_QuerySearchArgs__ = QuerySearchArgs


# The query type, represents all of the entry points into our object graph
class QueryCharacterArgs:
  id: Scalars.ID

__GQL_CODEGEN_QueryCharacterArgs__ = QueryCharacterArgs


# The query type, represents all of the entry points into our object graph
class QueryDroidArgs:
  id: Scalars.ID

__GQL_CODEGEN_QueryDroidArgs__ = QueryDroidArgs


# The query type, represents all of the entry points into our object graph
class QueryHumanArgs:
  id: Scalars.ID

__GQL_CODEGEN_QueryHumanArgs__ = QueryHumanArgs


# The query type, represents all of the entry points into our object graph
class QueryStarshipArgs:
  id: Scalars.ID

__GQL_CODEGEN_QueryStarshipArgs__ = QueryStarshipArgs

# The episodes in the Star Wars trilogy
class Episode(Enum):
  # Star Wars Episode IV: A New Hope, released in 1977.
  Newhope = 'NEWHOPE'
  # Star Wars Episode V: The Empire Strikes Back, released in 1980.
  Empire = 'EMPIRE'
  # Star Wars Episode VI: Return of the Jedi, released in 1983.
  Jedi = 'JEDI'

__GQL_CODEGEN_Episode__ = Episode

# A character from the Star Wars universe
class Character:
  # The ID of the character
  id: Scalars.ID
  # The name of the character
  name: Scalars.String
  # The friends of the character, or an empty list if they have none
  friends: Optional[List[Optional["__GQL_CODEGEN_Character__"]]]
  # The friends of the character exposed as a connection with edges
  friendsConnection: "__GQL_CODEGEN_FriendsConnection__"
  # The movies this character appears in
  appearsIn: List[Optional["__GQL_CODEGEN_Episode__"]]

__GQL_CODEGEN_Character__ = Character


# A character from the Star Wars universe
class CharacterFriendsConnectionArgs:
  first: Optional[Scalars.Int]
  after: Optional[Scalars.ID]

__GQL_CODEGEN_CharacterFriendsConnectionArgs__ = CharacterFriendsConnectionArgs

# A connection object for a character's friends
class FriendsConnection:
  __typename: Optional[Literal["FriendsConnection"]]
  # The total number of friends
  totalCount: Optional[Scalars.Int]
  # The edges for each of the character's friends.
  edges: Optional[List[Optional["__GQL_CODEGEN_FriendsEdge__"]]]
  # A list of the friends, as a convenience when edges are not needed.
  friends: Optional[List[Optional["__GQL_CODEGEN_Character__"]]]
  # Information for paginating this connection
  pageInfo: "__GQL_CODEGEN_PageInfo__"

__GQL_CODEGEN_FriendsConnection__ = FriendsConnection

# An edge object for a character's friends
class FriendsEdge:
  __typename: Optional[Literal["FriendsEdge"]]
  # A cursor used for pagination
  cursor: Scalars.ID
  # The character represented by this friendship edge
  node: Optional["__GQL_CODEGEN_Character__"]

__GQL_CODEGEN_FriendsEdge__ = FriendsEdge

# Information for paginating this connection
class PageInfo:
  __typename: Optional[Literal["PageInfo"]]
  startCursor: Optional[Scalars.ID]
  endCursor: Optional[Scalars.ID]
  hasNextPage: Scalars.Boolean

__GQL_CODEGEN_PageInfo__ = PageInfo

# Represents a review for a movie
class Review:
  __typename: Optional[Literal["Review"]]
  # The number of stars this review gave, 1-5
  stars: Scalars.Int
  # Comment about the movie
  commentary: Optional[Scalars.String]

__GQL_CODEGEN_Review__ = Review

SearchResult = Union["__GQL_CODEGEN_Human__", "__GQL_CODEGEN_Droid__", "__GQL_CODEGEN_Starship__"]
__GQL_CODEGEN_SearchResult__ = SearchResult

# A humanoid creature from the Star Wars universe
class Human(Character):
  __typename: Optional[Literal["Human"]]
  # The ID of the human
  id: Scalars.ID
  # What this human calls themselves
  name: Scalars.String
  # The home planet of the human, or null if unknown
  homePlanet: Optional[Scalars.String]
  # Height in the preferred unit, default is meters
  height: Optional[Scalars.Float]
  # Mass in kilograms, or null if unknown
  mass: Optional[Scalars.Float]
  # This human's friends, or an empty list if they have none
  friends: Optional[List[Optional["__GQL_CODEGEN_Character__"]]]
  # The friends of the human exposed as a connection with edges
  friendsConnection: "__GQL_CODEGEN_FriendsConnection__"
  # The movies this human appears in
  appearsIn: List[Optional["__GQL_CODEGEN_Episode__"]]
  # A list of starships this person has piloted, or an empty list if none
  starships: Optional[List[Optional["__GQL_CODEGEN_Starship__"]]]

__GQL_CODEGEN_Human__ = Human


# A humanoid creature from the Star Wars universe
class HumanHeightArgs:
  unit: Optional[LengthUnit]

__GQL_CODEGEN_HumanHeightArgs__ = HumanHeightArgs


# A humanoid creature from the Star Wars universe
class HumanFriendsConnectionArgs:
  first: Optional[Scalars.Int]
  after: Optional[Scalars.ID]

__GQL_CODEGEN_HumanFriendsConnectionArgs__ = HumanFriendsConnectionArgs

# Units of height
class LengthUnit(Enum):
  # The standard unit around the world
  Meter = 'METER'
  # Primarily used in the United States
  Foot = 'FOOT'

__GQL_CODEGEN_LengthUnit__ = LengthUnit

class Starship:
  __typename: Optional[Literal["Starship"]]
  # The ID of the starship
  id: Scalars.ID
  # The name of the starship
  name: Scalars.String
  # Length of the starship, along the longest axis
  length: Optional[Scalars.Float]

__GQL_CODEGEN_Starship__ = Starship


class StarshipLengthArgs:
  unit: Optional[LengthUnit]

__GQL_CODEGEN_StarshipLengthArgs__ = StarshipLengthArgs

# An autonomous mechanical character in the Star Wars universe
class Droid(Character):
  __typename: Optional[Literal["Droid"]]
  # The ID of the droid
  id: Scalars.ID
  # What others call this droid
  name: Scalars.String
  # This droid's friends, or an empty list if they have none
  friends: Optional[List[Optional["__GQL_CODEGEN_Character__"]]]
  # The friends of the droid exposed as a connection with edges
  friendsConnection: "__GQL_CODEGEN_FriendsConnection__"
  # The movies this droid appears in
  appearsIn: List[Optional["__GQL_CODEGEN_Episode__"]]
  # This droid's primary function
  primaryFunction: Optional[Scalars.String]

__GQL_CODEGEN_Droid__ = Droid


# An autonomous mechanical character in the Star Wars universe
class DroidFriendsConnectionArgs:
  first: Optional[Scalars.Int]
  after: Optional[Scalars.ID]

__GQL_CODEGEN_DroidFriendsConnectionArgs__ = DroidFriendsConnectionArgs

# The mutation type, represents all updates we can make to our data
class Mutation:
  __typename: Optional[Literal["Mutation"]]
  createReview: Optional["__GQL_CODEGEN_Review__"]

__GQL_CODEGEN_Mutation__ = Mutation


# The mutation type, represents all updates we can make to our data
class MutationCreateReviewArgs:
  episode: Optional[Episode]
  review: ReviewInput

__GQL_CODEGEN_MutationCreateReviewArgs__ = MutationCreateReviewArgs

# The input object sent when someone is creating a new review
class ReviewInput:
  # 0-5 stars
  stars: Scalars.Int
  # Comment about the movie, optional
  commentary: Optional[Scalars.String]
  # Favorite color, optional
  favoriteColor: Optional["__GQL_CODEGEN_ColorInput__"]

__GQL_CODEGEN_ReviewInput__ = ReviewInput

# The input object sent when passing a color
class ColorInput:
  red: Scalars.Int
  green: Scalars.Int
  blue: Scalars.Int

__GQL_CODEGEN_ColorInput__ = ColorInput
