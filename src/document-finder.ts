export const extractDocumentStringFromCodeFile = (fileContent: string): string | null => {
  let matches = fileContent.match(/gql`([\s\S\n\r.]*?)`/gm);

  if (matches === null) {
    matches = fileContent.match(/(['"](query|subscription|fragment|mutation) .*?['"])/gm);
  }

  return (matches || []).map(item => item.replace(/\$\{.*?\}/g, '').replace(/(gql|`)/g, '')).join();
};
