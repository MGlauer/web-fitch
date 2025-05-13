import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {BiconditionalElim, FalsumElim} from "../../src/fitch/rules.js";

describe("falsum elimination with parsing", () => {
    const testcases = [
            [["#"], "A"],
            [["#"], "P(a)"],
    ]
    ruleTestWithParser(FalsumElim, testcases)
});

const invalidTestcases = [
    [["B"], "A"],
    [["B&#"], "A"],
]

invalidRuleTestWithParser(FalsumElim, invalidTestcases)