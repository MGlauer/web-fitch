import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {BiconditionalIntro, ConditionalElim} from "../../src/fitch/rules.js";

describe("conditional elimination with parsing", () => {
    const testcases = [
            [["A>B","A"], "B"],
            [["P(a)>P(b)","P(a)"], "P(b)"],
    ]
    ruleTestWithParser(ConditionalElim, testcases)
});

const invalidTestcases = [
    [["C>B","A"], "B"],
    [["A>C","A"], "B"],
    [["A>B","C"], "B"],
    [["A>B","A"], "C"],
]

invalidRuleTestWithParser(ConditionalElim, invalidTestcases)