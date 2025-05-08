import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { BiconditionalIntro } from "../../src/fitch/rules.js";

describe("biconditional introduction with parsing", () => {
    const testcases = [
            [[["A","B"],["B","A"]], "A<>B"],
    ]
    ruleTestWithParser(BiconditionalIntro, testcases)
});