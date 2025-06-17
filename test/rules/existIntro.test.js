import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {ExistenceIntro} from "../../src/fitch/rules.js";

describe("existence introduction with parsing", () => {
    const testcases = [
            [["P(s)"], "?xP(x)"],
            [["Cube(a)"], "?xCube(x)"],
            [["~P(s)"], "?x~P(x)"],
            [["~Cube(a)"], "?x~Cube(x)"],
            [["!yCube(a,y)"], "?x!yCube(x,y)"],
            [["P(a)>Q(a)"], "?x(P(x)>Q(x))"],
            [["P(a)>!xQ(x)"], "?x(P(x)>!xQ(x))"]
    ]
    ruleTestWithParser(ExistenceIntro, testcases)
});

const invalidTestcases = [
    [[], "?xP(x)"],
    [["Tet(a)",], "?xCube(x)"],
    [["P(s)"], "?x~P(x)"],
    [["~Cube(a)"], "?xCube(x)"],
    [["P(a,b)"], "?xP(x,x)"],
    [["!xCube(x,s)"], "!x?yCube(x,y)"],
    [["Cube(s,s)"], "?x?yCube(x,y)"],
    [["P(a)>Q(a)"], "?x(P(x)>?xQ(x))"],
]

invalidRuleTestWithParser(ExistenceIntro, invalidTestcases)