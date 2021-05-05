from typing import Optional, List, Union, Any, Literal
from enum import Enum
class Scalars:
  ID = Union[str]
  String = Union[str]
  Boolean = Union[bool]
  Int = Union[int]
  Float = Union[float]

class User:
  __typename: Optional[Literal["User"]]
  id: Scalars.Int
  name: Scalars.String
  email: Scalars.String

__GQL_CODEGEN_User__ = User

class QueryRoot:
  __typename: Optional[Literal["QueryRoot"]]
  allUsers: List[Optional["__GQL_CODEGEN_User__"]]
  userById: Optional["__GQL_CODEGEN_User__"]
  answer: List[Scalars.Int]

__GQL_CODEGEN_QueryRoot__ = QueryRoot


class QueryRootUserByIdArgs:
  id: Scalars.Int

__GQL_CODEGEN_QueryRootUserByIdArgs__ = QueryRootUserByIdArgs

class SubscriptionRoot:
  __typename: Optional[Literal["SubscriptionRoot"]]
  newUser: Optional["__GQL_CODEGEN_User__"]

__GQL_CODEGEN_SubscriptionRoot__ = SubscriptionRoot
