import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { NegationElim } from "../../src/fitch/rules.js";

describe("negation elimination with parsing", () => {
    const testcases = [
            [["~~A"], "A"],
            [["~~P(a)"], "P(a)"],
    ]
    ruleTestWithParser(NegationElim, testcases)
});