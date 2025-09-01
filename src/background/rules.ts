import type { Rule } from "../types";

export const matchesRule = (url: string, rule: Rule): boolean => {
  try {
    if (rule.useRegex) {
      return new RegExp(rule.pattern).test(url);
    }
    // simple wildcard => regex
    const escaped = rule.pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}$`);
    return regex.test(url);
  } catch {
    return false;
  }
};

export const anyRuleMatches = (url: string, rules: Rule[]): boolean => {
  return rules.some((r) => matchesRule(url, r));
};
