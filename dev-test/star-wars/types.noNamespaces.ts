export type Maybe<T> = T | null;

/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  /** 0-5 stars */
  readonly stars: number;
  /** Comment about the movie, optional */
  readonly commentary?: Maybe<string>;
  /** Favorite color, optional */
  readonly favoriteColor?: Maybe<ColorInput>;
}
/** The input object sent when passing a color */
export interface ColorInput {

  readonly red: number;

  readonly green: number;

  readonly blue: number;
}
/** The episodes in the Star Wars trilogy */
export enum Episode {
  Newhope = 'NEWHOPE',
  Empire = 'EMPIRE',
  Jedi = 'JEDI',
}
/** Units of height */
export enum LengthUnit {
  Meter = 'METER',
  Foot = 'FOOT',
}


// ====================================================
// Documents
// ====================================================



export namespace CreateReviewForEpisode {
  export type Variables = {
    readonly episode: Episode;
    readonly review: ReviewInput;
  };

  export type Mutation = {
    readonly __typename?: 'Mutation';

    readonly createReview: Maybe<CreateReview>;
  };

  export type CreateReview = {
    readonly __typename?: 'Review';

    readonly stars: number;

    readonly commentary: Maybe<string>;
  };
}

export namespace HeroAndFriendsNames {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = {
    readonly __typename?: 'Character';

    readonly name: string;

    readonly friends: Maybe<ReadonlyArray<Maybe<Friends>>>;
  };

  export type Friends = {
    readonly __typename?: 'Character';

    readonly name: string;
  };
}

export namespace HeroAppearsIn {
  export type Variables = {
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = {
    readonly __typename?: 'Character';

    readonly name: string;

    readonly appearsIn: ReadonlyArray<Maybe<Episode>>;
  };
}

export namespace HeroDetails {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = {
    readonly __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];

    readonly name: string;
  }  & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';

    readonly height: Maybe<number>;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';

    readonly primaryFunction: Maybe<string>;
  };
}

export namespace HeroDetailsWithFragment {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = HeroDetails.Fragment;
}

export namespace HeroName {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = {
    readonly __typename?: 'Character';

    readonly name: string;
  };
}

export namespace HeroNameConditionalInclusion {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
    readonly includeName: boolean;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = {
    readonly __typename?: 'Character';

    readonly name: string;
  };
}

export namespace HeroNameConditionalExclusion {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
    readonly skipName: boolean;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = {
    readonly __typename?: 'Character';

    readonly name: string;
  };
}

export namespace HeroParentTypeDependentField {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = {
    readonly __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];

    readonly name: string;
  }  & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';

    readonly friends: Maybe<ReadonlyArray<Maybe<Friends>>>;
  };

  export type Friends = {
    readonly __typename?: _HumanInlineFragment['__typename'];

    readonly name: string;
  }  & _HumanInlineFragment;

  export type _HumanInlineFragment = {
    readonly __typename?: 'Human';

    readonly height: Maybe<number>;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';

    readonly friends: Maybe<ReadonlyArray<Maybe<_Friends>>>;
  };

  export type _Friends = {
    readonly __typename?: __HumanInlineFragment['__typename'];

    readonly name: string;
  }  & __HumanInlineFragment;

  export type __HumanInlineFragment = {
    readonly __typename?: 'Human';

    readonly height: Maybe<number>;
  };
}

export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    readonly episode?: Maybe<Episode>;
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly hero: Maybe<Hero>;
  };

  export type Hero = (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';

    readonly property: Maybe<string>;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';

    readonly property: Maybe<string>;
  };
}

export namespace HumanWithNullHeight {
  export type Variables = {
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly human: Maybe<Human>;
  };

  export type Human = {
    readonly __typename?: 'Human';

    readonly name: string;

    readonly mass: Maybe<number>;
  };
}

export namespace TwoHeroes {
  export type Variables = {
  };

  export type Query = {
    readonly __typename?: 'Query';

    readonly r2: Maybe<R2>;

    readonly luke: Maybe<Luke>;
  };

  export type R2 = {
    readonly __typename?: 'Character';

    readonly name: string;
  };

  export type Luke = {
    readonly __typename?: 'Character';

    readonly name: string;
  };
}

export namespace HeroDetails {
  export type Fragment = {
    readonly __typename?: 'Character';

    readonly name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    readonly __typename?: 'Human';

    readonly height: Maybe<number>;
  };

  export type DroidInlineFragment = {
    readonly __typename?: 'Droid';

    readonly primaryFunction: Maybe<string>;
  };
}

