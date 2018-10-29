export const toFragmentName = convert => (fragmentName: string): string => {
  return convert(`${fragmentName}Fragment`);
};
