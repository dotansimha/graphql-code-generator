import { LengthUnit } from './lengthunit.enum';
import { Character } from './character.interface';
import { FriendsConnection } from './friendsconnection.type';
import { Episode } from './episode.enum';
import { Starship } from './starship.type';
/* A humanoid creature from the Star Wars universe */
export interface Human extends Character {
  id: string; /* The ID of the human */
  name: string; /* What this human calls themselves */
  homePlanet: string | null; /* The home planet of the human, or null if unknown */
  height: number | null; /* Height in the preferred unit, default is meters */
  mass: number | null; /* Mass in kilograms, or null if unknown */
  friends: Character[] | null; /* This human&#x27;s friends, or an empty list if they have none */
  friendsConnection: FriendsConnection; /* The friends of the human exposed as a connection with edges */
  appearsIn: Episode[]; /* The movies this human appears in */
  starships: Starship[] | null; /* A list of starships this person has piloted, or an empty list if none */
}

export interface HeightHumanArgs {
  unit: LengthUnit | null; 
}
export interface FriendsConnectionHumanArgs {
  first: number | null; 
  after: string | null; 
}
