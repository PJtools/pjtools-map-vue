export function isZhCN(name) {
  return name ? /-cn\/?$/.test(name) : true;
}
