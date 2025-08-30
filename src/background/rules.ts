import type { Rule } from "../types";

export const matchesRule = (url: string, rule: Rule): boolean => {
  console.log(
    "ChromCognito: Checking rule:",
    rule.pattern,
    "against URL:",
    url,
  );
  try {
    if (rule.useRegex) {
      const result = new RegExp(rule.pattern).test(url);
      console.log("ChromCognito: Regex match result:", result);
      return result;
    }
    // simple wildcard => regex
    const escaped = rule.pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}$`);
    const result = regex.test(url);
    console.log(
      "ChromCognito: Wildcard pattern:",
      rule.pattern,
      "-> regex:",
      regex.source,
      "-> result:",
      result,
    );
    return result;
  } catch (error) {
    console.error("ChromCognito: Error matching rule:", error);
    return false;
  }
};

export const anyRuleMatches = (url: string, rules: Rule[]): boolean => {
  console.log(
    "ChromCognito: Checking",
    rules.length,
    "rules against URL:",
    url,
  );
  const result = rules.some((r) => matchesRule(url, r));
  console.log("ChromCognito: Any rule matches:", result);
  return result;
};
