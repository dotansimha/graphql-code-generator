// https://github.com/cenk1cenk2/listr2/blob/a554689c5e7b21f7781c183ab0bfba46cbd27545/src/utils/is-unicode-supported.ts
export function isUnicodeSupported(): boolean {
  if (process.platform !== 'win32') {
    return true;
  }

  /* istanbul ignore next */
  return (
    Boolean(process.env.CI) ||
    Boolean(process.env.WT_SESSION) ||
    process.env.TERM_PROGRAM === 'vscode' ||
    process.env.TERM === 'xterm-256color' ||
    process.env.TERM === 'alacritty'
  );
}
