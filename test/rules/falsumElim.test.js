import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { FalsumElim } from "../../src/fitch/rules.js";

describe("falsum elimination with parsing", () => {
    const testcases = [
            [["#"], "A"],
    ]
    ruleTestWithParser(FalsumElim, testcases)
});