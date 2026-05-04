/** 文字列または有限数値をトリムした文字列にし、それ以外は空文字。 */
export const scalarToTrimmedString = (v: unknown): string => {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v).trim();
  return "";
};

/** ACF 真偽（1 / "1" / "true" を true とみなす） */
export const acfTruthy = (v: unknown): boolean => {
  if (v === true || v === 1 || v === "1") return true;
  if (typeof v === "string" && v.toLowerCase() === "true") return true;
  return false;
};
