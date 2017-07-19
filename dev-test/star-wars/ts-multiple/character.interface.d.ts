import { FriendsConnection } from './friendsconnection.type';
import { Episode } from './episode.enum';
/* A character from the Star Wars universe */
export interface Character {
  id: string; /* The ID of the character */
  name: string; /* The name of the character */
  friends: Character[] | null; /* The friends of the character, or an empty list if they have none */
  friendsConnection: FriendsConnection; /* The friends of the character exposed as a connection with edges */
  appearsIn: Episode[]; /* The movies this character appears in */
}

export interface FriendsConnectionCharacterArgs {
  first: number | null; 
  after: string | null; 
}
