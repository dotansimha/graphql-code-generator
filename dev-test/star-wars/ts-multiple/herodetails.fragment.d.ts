export namespace HeroDetails {
  export type Fragment = {
    __typename?: "Character";
    name: string; 
  } & (HumanInlineFragment | DroidInlineFragment)
  export type HumanInlineFragment = {
    __typename?: "Human";
    height?: number | null; 
  }
  export type DroidInlineFragment = {
    __typename?: "Droid";
    primaryFunction?: string | null; 
  }
}
