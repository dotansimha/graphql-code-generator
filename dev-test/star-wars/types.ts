/** The input object sent when someone is creating a new review */
export interface ReviewInput {
  /** 0-5 stars */
  stars: number;
  /** Comment about the movie, optional */
  commentary?: string | null;
  /** Favorite color, optional */
  favoriteColor?: ColorInput | null;
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
    episode: Episode;
    review: ReviewInput;
  };

  export type Mutation = {
    __typename?: 'Mutation';

    createReview: CreateReview | null;
  };

  export type CreateReview = {
    __typename?: 'Review';

    stars: number;

    commentary: string | null;
  };
}

export namespace HeroAndFriendsNames {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;

    friends: (Friends | null)[] | null;
  };

  export type Friends = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroAppearsIn {
  export type Variables = {
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;

    appearsIn: (Episode | null)[];
  };
}

export namespace HeroDetails {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = {
    __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];

    name: string;
  }  & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';

    height: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    primaryFunction: string | null;
  };
}

export namespace HeroDetailsWithFragment {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = HeroDetails.Fragment;
}

export namespace HeroName {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroNameConditionalInclusion {
  export type Variables = {
    episode?: Episode | null;
    includeName: boolean;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroNameConditionalExclusion {
  export type Variables = {
    episode?: Episode | null;
    skipName: boolean;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = {
    __typename?: 'Character';

    name: string;
  };
}

export namespace HeroParentTypeDependentField {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = {
    __typename?: HumanInlineFragment['__typename'] | DroidInlineFragment['__typename'];

    name: string;
  }  & (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';

    friends: (Friends | null)[] | null;
  };

  export type Friends = {
    __typename?: _HumanInlineFragment['__typename'];

    name: string;
  }  & _HumanInlineFragment;

  export type _HumanInlineFragment = {
    __typename?: 'Human';

    height: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    friends: (_Friends | null)[] | null;
  };

  export type _Friends = {
    __typename?: __HumanInlineFragment['__typename'];

    name: string;
  }  & __HumanInlineFragment;

  export type __HumanInlineFragment = {
    __typename?: 'Human';

    height: number | null;
  };
}

export namespace HeroTypeDependentAliasedField {
  export type Variables = {
    episode?: Episode | null;
  };

  export type Query = {
    __typename?: 'Query';

    hero: Hero | null;
  };

  export type Hero = (HumanInlineFragment | DroidInlineFragment);

  export type HumanInlineFragment = {
    __typename?: 'Human';

    property: string | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    property: string | null;
  };
}

export namespace HumanWithNullHeight {
  export type Variables = {
  };

  export type Query = {
    __typename?: 'Query';

    human: Human | null;
  };

  export type Human = {
    __typename?: 'Human';

    name: string;

    mass: number | null;
  };
}

export namespace TwoHeroes {
  export type Variables = {
  };

  export type Query = {
    __typename?: 'Query';

    r2: R2 | null;

    luke: Luke | null;
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

    height: number | null;
  };

  export type DroidInlineFragment = {
    __typename?: 'Droid';

    primaryFunction: string | null;
  };
}

