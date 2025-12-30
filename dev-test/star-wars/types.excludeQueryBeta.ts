type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** The episodes in the Star Wars trilogy */
export type Episode =
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI'
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE';

export type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = { createReview: { stars: number; commentary: string | null } | null };

export type ExcludeQueryAlphaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type ExcludeQueryAlphaQuery = { hero: { name: string } | { name: string } | null };

export type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroAndFriendsNamesQuery = {
  hero:
    | { name: string; friends: Array<{ name: string } | { name: string } | null> | null }
    | { name: string; friends: Array<{ name: string } | { name: string } | null> | null }
    | null;
};

export type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

export type HeroAppearsInQuery = {
  hero: { name: string; appearsIn: Array<Episode | null> } | { name: string; appearsIn: Array<Episode | null> } | null;
};

export type HeroDetailsQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsQuery = {
  hero: { primaryFunction: string | null; name: string } | { height: number | null; name: string } | null;
};

type HeroDetails_Droid_Fragment = { primaryFunction: string | null; name: string };

type HeroDetails_Human_Fragment = { height: number | null; name: string };

export type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

export type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroDetailsWithFragmentQuery = {
  hero: { primaryFunction: string | null; name: string } | { height: number | null; name: string } | null;
};

export type HeroNameQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroNameQuery = { hero: { name: string } | { name: string } | null };

export type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Episode | null;
  includeName: boolean;
}>;

export type HeroNameConditionalInclusionQuery = { hero: { name?: string } | { name?: string } | null };

export type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Episode | null;
  skipName: boolean;
}>;

export type HeroNameConditionalExclusionQuery = { hero: { name?: string } | { name?: string } | null };

export type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroParentTypeDependentFieldQuery = {
  hero:
    | { name: string; friends: Array<{ name: string } | { height: number | null; name: string } | null> | null }
    | { name: string; friends: Array<{ name: string } | { height: number | null; name: string } | null> | null }
    | null;
};

export type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

export type HeroTypeDependentAliasedFieldQuery = {
  hero: { property: string | null } | { property: string | null } | null;
};

export type HumanFieldsFragment = { name: string; mass: number | null };

export type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

export type HumanWithNullHeightQuery = { human: { name: string; mass: number | null } | null };

export type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

export type TwoHeroesQuery = {
  r2: { name: string } | { name: string } | null;
  luke: { name: string } | { name: string } | null;
};
