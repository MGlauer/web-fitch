import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { DisjunctionElim } from "../../src/fitch/rules.js";

describe("disjunction elimination with parsing", () => {
    const testcases = [
            [["A|B",["A","C"],["B","C"]], "C"],
            [["P(a)|P(b)",["P(a)","P(c)"],["P(b)","P(c)"]], "P(c)"],
    ]
    ruleTestWithParser(DisjunctionElim, testcases)
});