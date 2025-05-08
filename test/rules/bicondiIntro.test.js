import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { BiconditionalIntro } from "../../src/fitch/rules.js";

describe("biconditional introduction with parsing", () => {
    const testcases = [
            [[["A","B"],["B","A"]], "A<>B"],
            [[["B","A"],["A","B"]], "A<>B"],
            [[["P(a)","P(b)"],["P(b)","P(a)"]], "P(a)<>P(b)"],
    ]
    ruleTestWithParser(BiconditionalIntro, testcases)
});