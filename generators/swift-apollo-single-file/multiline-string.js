function escapedString(string) {
  return string.replace(/"/g, '\\"');
}

module.exports = (document) => {
  if (!document) {
    return '';
  }

  const lines = document.split('\n');
  return lines.map((line, index) => {
    const isLastLine = index != lines.length - 1;

    return `"${escapedString(line)}"` + (isLastLine ? ' +' : '');
  }).join('\r\n');
};
