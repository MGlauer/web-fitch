import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {AllElim} from "../../src/fitch/rules.js";

describe("existence introduction with parsing", () => {
    const testcases = [
            [["!xP(x)"], "P(s)"],
            [["!xCube(x)"], "Cube(s)"],
            [["!x~P(x)"], "~P(s)"],
            [["!x~Cube(x)"], "~Cube(s)"],
            [["!x!yCube(x,y)"], "!yCube(s,y)"]
    ]
    ruleTestWithParser(AllElim, testcases)
});

const invalidTestcases = [
    [[], "!xP(x)"],
    [["!xTet(x)",], "Cube(s)"],
    [["!xS(y)"], "S(s)"],
    [["!xP(x)"], "~P(s)"],
    [["!x~Cube(x)"], "Cube(x)"],
    [["!x!yCube(x,y)"], "!xCube(x,s)"],
    [["!x!yCube(x,y)"], "!yCube(x,y)"],
    [["!x!yCube(x,y)"], "Cube(s,s)"]
]

invalidRuleTestWithParser(AllElim, invalidTestcases)