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
    return new RegExp(`^${escaped}$`).test(url);
  } catch {
    return false;
  }
};

export const anyRuleMatches = (url: string, rules: Rule[]): boolean =>
  rules.some((r) => matchesRule(url, r));
