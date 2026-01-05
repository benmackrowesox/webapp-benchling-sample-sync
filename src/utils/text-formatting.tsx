const LATIN_PATTERN = /^(.+)\((.+)\)$/; // match1: everything before brackets. match2: everything in brackets at the end. e.g. match1 (match2)

export const italicizeContentInBrackets = (s: string) => {
  const res = s.match(LATIN_PATTERN);
  if (!res) {
    return s;
  }

  return (
    <>
      {res[1]}(<em>{res[2]}</em>)
    </>
  );
};
