import { ColorInput } from './colorinput.input-type';
/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  stars: number /** 0-5 stars */;
  commentary?: string | null /** Comment about the movie, optional */;
  favoriteColor?: ColorInput | null /** Favorite color, optional */;
}
