import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {ExistsElim} from "../../src/fitch/rules.js";

describe("existence introduction with parsing", () => {
    const testcases = [
            [["?xP(x)",["P(a)","Q(b)"]], "Q(b)", "a"],
    ]
    ruleTestWithParser(ExistsElim, testcases)
});

const invalidTestcases = [
    [["?xP(x)",["P(a)","Q(b)"]], "Q(b)", "b"],
    [["?xP(a)",["P(b)","Q(b)"]], "Q(b)", "a"],
    [["?xP(x)",["Q(a)","Q(b)"]], "Q(b)", "a"],
    [["?xP(x)",["P(a)","Q(a)"]], "Q(a)", "a"],
    [["?xP(x)",["P(a)","Q(b)"]], "Q(a)", "a"],
]

invalidRuleTestWithParser(ExistsElim, invalidTestcases)