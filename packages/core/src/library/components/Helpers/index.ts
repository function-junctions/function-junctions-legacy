export const generateUniqueIdFromRecord = (idTree: Record<string, unknown>): string => {
  let requestedId = Object.keys(idTree).length;
  let checking = true;

  while (checking) {
    if (requestedId.toString() in idTree) {
      requestedId += 1;
    } else {
      checking = false;
    }
  }

  return requestedId.toString();
};
