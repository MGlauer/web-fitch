import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {BiconditionalElim, BiconditionalIntro} from "../../src/fitch/rules.js";

describe("biconditional introduction with parsing", () => {
    const testcases = [
            [[["A","B"],["B","A"]], "A<>B"],
            [[["B","A"],["A","B"]], "A<>B"],
            [[["P(a)","P(b)"],["P(b)","P(a)"]], "P(a)<>P(b)"],
    ]
    ruleTestWithParser(BiconditionalIntro, testcases)
});

const invalidTestcases = [
    [[["A","B"],["B","C"]], "A<>B"],
    [[["A","B"],["C","A"]], "A<>B"],
    [[["A","C"],["B","A"]], "A<>B"],
    [[["C","B"],["B","A"]], "A<>B"],
    [[["A","B"],["B","A"]], "C<>B"],
    [[["A","B"],["B","A"]], "A<>C"],
]

invalidRuleTestWithParser(BiconditionalIntro, invalidTestcases)