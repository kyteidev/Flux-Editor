export const checkDirValidity = (dir: string) => {
  const directoryPathRegex = /^\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/$/;

  if (directoryPathRegex.test(dir)) {
    return true;
  } else {
    return false;
  }
};
