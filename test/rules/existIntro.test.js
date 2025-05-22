import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {ExistenceIntro} from "../../src/fitch/rules.js";

describe("existence introduction with parsing", () => {
    const testcases = [
            [["P(s)"], "?xP(x)"],
            [["Cube(a)"], "?xCube(x)"],
            [["~P(s)"], "?x~P(x)"],
            [["~Cube(a)"], "?x~Cube(x)"]
    ]
    ruleTestWithParser(ExistenceIntro, testcases)
});

const invalidTestcases = [
    [[], "?xP(x)"],
    [["Tet(a)",], "?xCube(x)"],
    [["S(s)"], "?yS(x)"],
    [["P(s)"], "?x~P(x)"],
    [["~Cube(a)"], "?xCube(x)"]
]

invalidRuleTestWithParser(ExistenceIntro, invalidTestcases)