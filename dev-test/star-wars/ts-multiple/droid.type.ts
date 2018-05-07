import { Character } from './character.interface';
import { FriendsConnection } from './friendsconnection.type';
import { Episode } from './episode.enum';
/** An autonomous mechanical character in the Star Wars universe */
export interface Droid extends Character {
  id: string /** The ID of the droid */;
  name: string /** What others call this droid */;
  friends?: (Character | null)[] | null /** This droid's friends, or an empty list if they have none */;
  friendsConnection: FriendsConnection /** The friends of the droid exposed as a connection with edges */;
  appearsIn: (Episode | null)[] /** The movies this droid appears in */;
  primaryFunction?: string | null /** This droid's primary function */;
}

export interface FriendsConnectionDroidArgs {
  first?: number | null;
  after?: string | null;
}
