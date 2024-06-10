export const getClosingBracket = (openingBracket: string): string => {
    const closingBrackets: Record<string, string> = {
      "{": "}",
      "[": "]",
      "(": ")",
    };
  
    return closingBrackets[openingBracket] || "";
  }