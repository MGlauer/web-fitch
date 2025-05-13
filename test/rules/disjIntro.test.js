import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {BiconditionalElim, DisjunctionIntro} from "../../src/fitch/rules.js";

describe("disjunction introduction with parsing", () => {
    const testcases = [
            [["A"], "~A|A"],
            [["A"], "A|~A"],
            [["P(a)"], "P(a)|~P(a)"],
            [["P(a)"], "P(a)|~P(a)"],
    ]
    ruleTestWithParser(DisjunctionIntro, testcases)
});

const invalidTestcases = [
    [["A",], "C|B"],
    [["A",], "A"],
]

invalidRuleTestWithParser(DisjunctionIntro, invalidTestcases)