import { Character } from './character.interface';
/** An edge object for a character's friends */
export interface FriendsEdge {
  cursor: string /** A cursor used for pagination */;
  node?: Character | null /** The character represented by this friendship edge */;
}
