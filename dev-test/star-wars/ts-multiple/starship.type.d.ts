import { LengthUnit } from './lengthunit.enum';

export interface Starship {
  id: string; /* The ID of the starship */
  name: string; /* The name of the starship */
  length: number | null; /* Length of the starship, along the longest axis */
}

export interface LengthStarshipArgs {
  unit: LengthUnit | null; 
}
