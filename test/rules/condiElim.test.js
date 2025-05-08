import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { ConditionalElim } from "../../src/fitch/rules.js";

describe("conditional elimination with parsing", () => {
    const testcases = [
            [["A>B","A"], "B"],
    ]
    ruleTestWithParser(ConditionalElim, testcases)
});