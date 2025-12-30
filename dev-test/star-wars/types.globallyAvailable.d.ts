type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** The episodes in the Star Wars trilogy */
type Episode =
  /** Star Wars Episode V: The Empire Strikes Back, released in 1980. */
  | 'EMPIRE'
  /** Star Wars Episode VI: Return of the Jedi, released in 1983. */
  | 'JEDI'
  /** Star Wars Episode IV: A New Hope, released in 1977. */
  | 'NEWHOPE';

type CreateReviewForEpisodeMutationVariables = Exact<{
  episode: Episode;
  review: ReviewInput;
}>;

type CreateReviewForEpisodeMutation = { createReview: { stars: number; commentary: string | null } | null };

type ExcludeQueryAlphaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type ExcludeQueryAlphaQuery = { hero: { name: string } | { name: string } | null };

type ExcludeQueryBetaQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type ExcludeQueryBetaQuery = { hero: { name: string } | { name: string } | null };

type HeroAndFriendsNamesQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroAndFriendsNamesQuery = {
  hero:
    | { name: string; friends: Array<{ name: string } | { name: string } | null> | null }
    | { name: string; friends: Array<{ name: string } | { name: string } | null> | null }
    | null;
};

type HeroAppearsInQueryVariables = Exact<{ [key: string]: never }>;

type HeroAppearsInQuery = {
  hero: { name: string; appearsIn: Array<Episode | null> } | { name: string; appearsIn: Array<Episode | null> } | null;
};

type HeroDetailsQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroDetailsQuery = {
  hero: { primaryFunction: string | null; name: string } | { height: number | null; name: string } | null;
};

type HeroDetails_Droid_Fragment = { primaryFunction: string | null; name: string };

type HeroDetails_Human_Fragment = { height: number | null; name: string };

type HeroDetailsFragment = HeroDetails_Droid_Fragment | HeroDetails_Human_Fragment;

type HeroDetailsWithFragmentQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroDetailsWithFragmentQuery = {
  hero: { primaryFunction: string | null; name: string } | { height: number | null; name: string } | null;
};

type HeroNameQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroNameQuery = { hero: { name: string } | { name: string } | null };

type HeroNameConditionalInclusionQueryVariables = Exact<{
  episode?: Episode | null;
  includeName: boolean;
}>;

type HeroNameConditionalInclusionQuery = { hero: { name?: string } | { name?: string } | null };

type HeroNameConditionalExclusionQueryVariables = Exact<{
  episode?: Episode | null;
  skipName: boolean;
}>;

type HeroNameConditionalExclusionQuery = { hero: { name?: string } | { name?: string } | null };

type HeroParentTypeDependentFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroParentTypeDependentFieldQuery = {
  hero:
    | { name: string; friends: Array<{ name: string } | { height: number | null; name: string } | null> | null }
    | { name: string; friends: Array<{ name: string } | { height: number | null; name: string } | null> | null }
    | null;
};

type HeroTypeDependentAliasedFieldQueryVariables = Exact<{
  episode?: Episode | null;
}>;

type HeroTypeDependentAliasedFieldQuery = { hero: { property: string | null } | { property: string | null } | null };

type HumanFieldsFragment = { name: string; mass: number | null };

type HumanWithNullHeightQueryVariables = Exact<{ [key: string]: never }>;

type HumanWithNullHeightQuery = { human: { name: string; mass: number | null } | null };

type TwoHeroesQueryVariables = Exact<{ [key: string]: never }>;

type TwoHeroesQuery = {
  r2: { name: string } | { name: string } | null;
  luke: { name: string } | { name: string } | null;
};
