import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {FalsumElim, FalsumIntro} from "../../src/fitch/rules.js";

describe("falsum introduction with parsing", () => {
    const testcases = [
            [["A","~A"], "#"],
            [["~A","A"], "#"],
            [["P(a)","~P(a)"], "#"],
    ]
    ruleTestWithParser(FalsumIntro, testcases)
});

const invalidTestcases = [
    [["A","~B"], "#"],
    [["A","~A"], "B"],
]

invalidRuleTestWithParser(FalsumIntro, invalidTestcases)