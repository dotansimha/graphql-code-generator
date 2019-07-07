export const FLOW_REQUIRE_FIELDS_TYPE = `export type $RequireFields<Origin, Keys> = $Diff<Args, Keys> & $ObjMapi<Keys, <Key>(k: Key) => $NonMaybeType<$ElementType<Origin, Key>>>;`;
