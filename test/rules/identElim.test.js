import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {IdentityElim,} from "../../src/fitch/rules.js";

describe("identity elimination with parsing", () => {
    const testcases = [
        [["P(a)","a=b"], "P(b)"],
        [["P(a)","a=b"], "P(a)"],
        [["~P(a)","a=b"], "~P(b)"],
        [["~P(a)","a=b"], "~P(a)"],
        [["P(a, b)","a=b"], "P(a, a)"],
        [["P(a, b)","a=b"], "P(b, b)"],
        [["~P(a, b)","a=b"], "~P(a, a)"],
        [["~P(a, b)","a=b"], "~P(b, b)"],
        [["P(a, a, b)","a=b"], "P(b, a, b)"],
    ]
    ruleTestWithParser(IdentityElim, testcases)
});

const invalidTestcases = [
        [["P(a)","a=b"], "P(c)"],
        [["~P(a)","a=b"], "~P(c)"],
        [["~P(a)","a=b"], "P(a)"],
        [["P(a, b)","a=b"], "P(c, c)"],
        [["~P(a, b)","a=b"], "P(a, a)"],
]

invalidRuleTestWithParser(IdentityElim, invalidTestcases)