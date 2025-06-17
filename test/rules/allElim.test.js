import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {AllElim} from "../../src/fitch/rules.js";

describe("existence introduction with parsing", () => {
    const testcases = [
            [["!xP(x)"], "P(s)"],
            [["!xCube(x)"], "Cube(s)"],
            [["!x~P(x)"], "~P(s)"],
            [["!x~Cube(x)"], "~Cube(s)"],
            [["!x!yCube(x,y)"], "!yCube(s,y)"],
            [["!x(P(x)>Q(x))"], "P(a)>Q(a)"],
            [["!x(P(x)>!xQ(x))"], "P(a)>!xQ(x)"]
    ]
    ruleTestWithParser(AllElim, testcases)
});

const invalidTestcases = [
    [[], "!xP(x)"],
    [["!xTet(x)",], "Cube(s)"],
    [["!xP(x)"], "~P(s)"],
    [["!x!yCube(x,y)"], "!xCube(x,s)"],
    [["!x!yCube(x,y)"], "Cube(s,s)"],
    [["!x(P(x)>!xQ(x))"], "P(a)>Q(a)"]
]

invalidRuleTestWithParser(AllElim, invalidTestcases)