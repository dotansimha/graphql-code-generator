from typing import Optional, List, Literal, Union, Any
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

class Query:
  __typename: Optional[Literal["Query"]]
  allUsers: List[Optional["__GQL_CODEGEN_User__"]]
  userById: Optional["__GQL_CODEGEN_User__"]
  """
   Generates a new answer for th
  guessing game
  """
  answer: List[Scalars.Int]
  testArr1: Optional[List[Optional[Scalars.String]]]
  testArr2: List[Optional[Scalars.String]]
  testArr3: List[Scalars.String]

__GQL_CODEGEN_Query__ = Query


class QueryUserByIdArgs:
  id: Scalars.Int

__GQL_CODEGEN_QueryUserByIdArgs__ = QueryUserByIdArgs
