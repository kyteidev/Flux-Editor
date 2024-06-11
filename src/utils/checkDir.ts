export const checkDirValidity = (dir: string) => {
  const directoryPathRegex = /^(\/|[a-zA-Z]:\\)[^\/\\]+(\/|\\)[^\/\\]+$/;

  if (directoryPathRegex.test(dir)) {
    return true;
  } else {
    return false;
  }
};
