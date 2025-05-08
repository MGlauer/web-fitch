import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { DisjunctionIntro } from "../../src/fitch/rules.js";

describe("disjunction introduction with parsing", () => {
    const testcases = [
            [["A"], "~A|A"],
            [["A"], "A|~A"],
            [["P(a)"], "P(a)|~P(a)"],
            [["P(a)"], "P(a)|~P(a)"],
    ]
    ruleTestWithParser(DisjunctionIntro, testcases)
});