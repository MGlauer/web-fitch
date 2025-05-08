import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { DisjunctionElim } from "../../src/fitch/rules.js";

describe("disjunction elimination with parsing", () => {
    const testcases = [
            [["A|B",["A","C"],["B","C"]], "C"],
    ]
    ruleTestWithParser(DisjunctionElim, testcases)
});