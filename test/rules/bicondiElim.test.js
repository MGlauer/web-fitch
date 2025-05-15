import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {BiconditionalElim, DisjunctionElim} from "../../src/fitch/rules.js";

describe("biconditional elimination with parsing", () => {
    const testcases = [
            [["A<>B","A"], "B"],
            [["A<>B","B"], "A"],
            [["P(a)<>P(b)","P(a)"], "P(b)"],
    ]
    ruleTestWithParser(BiconditionalElim, testcases)
});

const invalidTestcases = [
    [["A<>B","C",], "A"],
    [["A<>B","C"], "B"],
    [["A<>B","A"], "C"],
    [["A<>B","B"], "C"],
]

invalidRuleTestWithParser(BiconditionalElim, invalidTestcases)