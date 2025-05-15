import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {ConditionalElim, ConditionalIntro} from "../../src/fitch/rules.js";

describe("conditional introduction with parsing", () => {
    const testcases = [
            [[["A","B"]], "A>B"],
            [[["P(a)","P(b)"]], "P(a)>P(b)"],
    ]
    ruleTestWithParser(ConditionalIntro, testcases)
});

const invalidTestcases = [
    [[["C","B"]], "A>B"],
    [[["A","C"]], "A>B"],
    [[["A","B"]], "C>B"],
    [[["A","B"]], "A>C"],
]

invalidRuleTestWithParser(ConditionalIntro, invalidTestcases)