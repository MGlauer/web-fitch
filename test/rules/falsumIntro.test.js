import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { FalsumIntro } from "../../src/fitch/rules.js";

describe("falsum introduction with parsing", () => {
    const testcases = [
            [["A","~A"], "#"],
    ]
    ruleTestWithParser(FalsumIntro, testcases)
});