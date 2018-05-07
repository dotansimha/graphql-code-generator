/** Represents a review for a movie */
export interface Review {
  stars: number /** The number of stars this review gave, 1-5 */;
  commentary?: string | null /** Comment about the movie */;
}
