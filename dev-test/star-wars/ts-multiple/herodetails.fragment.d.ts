export namespace HeroDetails {
  export type Fragment = {
    name: string; 
  }  & HumanInlineFragment & DroidInlineFragment
  export type HumanInlineFragment = {
    height: number | null; 
  } 
  export type DroidInlineFragment = {
    primaryFunction: string | null; 
  } 
}