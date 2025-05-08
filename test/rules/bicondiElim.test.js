import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { BiconditionalElim } from "../../src/fitch/rules.js";

describe("biconditional introduction with parsing", () => {
    const testcases = [
            [["A<>B","A"], "B"],
    ]
    ruleTestWithParser(BiconditionalElim, testcases)
});