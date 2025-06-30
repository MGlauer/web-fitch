import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {AllIntro} from "../../src/fitch/rules.js";

describe("existence introduction with parsing", () => {
    const testcases = [
            [[["","P(a)"]], "!x P(x)", "a"],
            [[["","P(a,a)"]], "!x P(x,x)", "a"],
    ]
    ruleTestWithParser(AllIntro, testcases)
});

const invalidTestcases = [
    [[["","P(a)"]], "!x P(x)", "b"],
    [[["","P(a,a)"]], "!x P(x,a)", "a"],
]

invalidRuleTestWithParser(AllIntro, invalidTestcases)