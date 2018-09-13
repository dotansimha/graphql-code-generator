export function eq(val1, val2, block) {
  if (val1 === val2) {
    return block(this);
  }
}
