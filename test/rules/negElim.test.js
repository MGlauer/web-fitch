import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {FalsumIntro, NegationElim} from "../../src/fitch/rules.js";

describe("negation elimination with parsing", () => {
    const testcases = [
            [["~~A"], "A"],
            [["~~~A"], "~A"],
            [["~~~~A"], "~~A"],
            [["~~P(a)"], "P(a)"],
    ]
    ruleTestWithParser(NegationElim, testcases)
});

const invalidTestcases = [
    [["~~A"], "B"],
]

invalidRuleTestWithParser(NegationElim, invalidTestcases)