interface Array<T> {
  sortInsensitive(): T[];
}

Array.prototype.sortInsensitive = function () {
  return this.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
};
