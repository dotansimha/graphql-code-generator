// https://github.com/cenk1cenk2/listr2/blob/a554689c5e7b21f7781c183ab0bfba46cbd27545/src/utils/parse-time.ts
export function parseTaskTime(duration: number): string {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);

  let parsedTime: string;

  if (seconds === 0 && minutes === 0) {
    parsedTime = `0.${Math.floor(duration / 100)}s`;
  }

  if (seconds > 0) {
    parsedTime = `${seconds % 60}s`;
  }

  if (minutes > 0) {
    parsedTime = `${minutes}m${parsedTime}`;
  }

  return parsedTime;
}
