export type Maybe<T> = T | null;

/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  /** 0-5 stars */
  stars: number;
  /** Comment about the movie, optional */
  commentary: Maybe<string>;
  /** Favorite color, optional */
  favoriteColor: Maybe<ColorInput>;
}
/** The input object sent when passing a color */
export interface ColorInput {
  red: number;

  green: number;

  blue: number;
}
/** The episodes in the Star Wars trilogy */
export enum Episode {
  Newhope = 'NEWHOPE',
  Empire = 'EMPIRE',
  Jedi = 'JEDI'
}
/** Units of height */
export enum LengthUnit {
  Meter = 'METER',
  Foot = 'FOOT'
}

// ====================================================
// Documents
// ====================================================

export namespace CreateReviewForEpisode {
  export type Variables = {
    episode: Episode;
    review: ReviewInput;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    createReview: Maybe<CreateReview>;
  };

  export type CreateReview = {
    __typename?: 'Review';

    stars: number;

    commentary: Maybe<string>;
  };
}

export namespace HeroAndFriendsNames {
  export type Variables = {
    episode: Maybe<Episode>;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;

    friends: Maybe<(Maybe<Friends>)[]>;
  };

  export type Friends = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroAppearsIn {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;

    appearsIn: (Maybe<Episode>)[];
  };
}

export namespace HeroDetails {
  export type Variables = {
    episode: Maybe<Episode>;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = {
    __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];

    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';

    height: Maybe<number>;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    primaryFunction: Maybe<string>;
  };
}

export namespace HeroDetailsWithFragment {
  export type Variables = {
    episode: Maybe<Episode>;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = HeroDetails.Fragment;
}

export namespace HeroName {
  export type Variables = {
    episode: Maybe<Episode>;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroNameConditionalInclusion {
  export type Variables = {
    episode: Maybe<Episode>;
    includeName: boolean;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroNameConditionalExclusion {
  export type Variables = {
    episode: Maybe<Episode>;
    skipName: boolean;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroParentTypeDependentField {
  export type Variables = {
    episode: Maybe<Episode>;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = {
    __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];

    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';

    friends: Maybe<(Maybe<Friends>)[]>;
  };

  export type Friends = {
    __typename?: _HumanInlineFragment['__typename'];

    name: string;
  } & _HumanInlineFragment;

  export type _HumanInlineFragment = {
    __typename?: 'Human';

    height: Maybe<number>;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    friends: Maybe<(Maybe<_Friends>)[]>;
  };

  export type _Friends = {
    __typename?: __HumanInlineFragment['__typename'];

    name: string;
  } & __HumanInlineFragment;

  export type __HumanInlineFragment = {
    __typename?: 'Human';

    height: Maybe<number>;
  };
}

export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    episode: Maybe<Episode>;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Maybe<Hero>;
  };

  export type Hero = HumanInlineFragment | DroidInlineFragment;

  export type HumanInlineFragment = {
    __typename?: 'Human';

    property: Maybe<string>;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    property: Maybe<string>;
  };
}

export namespace HumanWithNullHeight {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';

    human: Maybe<Human>;
  };

  export type Human = {
    __typename?: 'Human';

    name: string;

    mass: Maybe<number>;
  };
}

export namespace TwoHeroes {
  export type Variables = {};

  export type Query = {
    __typename?: 'Query';

    r2: Maybe<R2>;

    luke: Maybe<Luke>;
  };

  export type R2 = {
    __typename?: 'Character';

    name: string;
  };

  export type Luke = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroDetails {
  export type Fragment = {
    __typename?: 'Character';

    name: string;
  } & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';

    height: Maybe<number>;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    primaryFunction: Maybe<string>;
  };
}
