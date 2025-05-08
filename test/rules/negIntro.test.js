import { describe, it, expect } from "vitest";
import {ruleTestWithParser} from "./base.js"
import { NegationIntro } from "../../src/fitch/rules.js";

describe("negation introduction with parsing", () => {
    const testcases = [
            [[["P(a)","#"]], "~P(a)"],
    ]
    ruleTestWithParser(NegationIntro, testcases)
});