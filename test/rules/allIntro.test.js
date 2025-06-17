import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {AllIntro} from "../../src/fitch/rules.js";

describe("existence introduction with parsing", () => {
    const testcases = [
            [[["","P(a)"]], "!x P(x)"],
    ]
    ruleTestWithParser(AllIntro, testcases)
});

const invalidTestcases = [
    [[], "!xP(x)"],
    [["!xTet(x)",], "Cube(s)"],
    [["!xP(x)"], "~P(s)"],
    [["!x!yCube(x,y)"], "!xCube(x,s)"],
    [["!x!yCube(x,y)"], "Cube(s,s)"],
    [["!x(P(x)>!xQ(x))"], "P(a)>Q(a)"]
]

invalidRuleTestWithParser(AllIntro, invalidTestcases)