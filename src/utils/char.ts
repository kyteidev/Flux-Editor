export const getClosingChar = (openingChar: string): string => {
    const closingChars: Record<string, string> = {
      "{": "}",
      "[": "]",
      "(": ")",
      '"': '"',
      "'": "'",
    };
  
    return closingChars[openingChar] || "";
  }