import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { ConditionalIntro } from "../../src/fitch/rules.js";

describe("conditional introduction with parsing", () => {
    const testcases = [
            [[["A","B"]], "A>B"],
    ]
    ruleTestWithParser(ConditionalIntro, testcases)
});