import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {NegationElim, NegationIntro} from "../../src/fitch/rules.js";

describe("negation introduction with parsing", () => {
    const testcases = [
        [[["A","#"]], "~A"],
        [[["P(a)","#"]], "~P(a)"],
    ]
    ruleTestWithParser(NegationIntro, testcases)
});

const invalidTestcases = [
    [[["B","#"]], "~A"],
    [[["A","B"]], "~A"],
    [[["A","#"]], "~B"],
]

invalidRuleTestWithParser(NegationElim, invalidTestcases)