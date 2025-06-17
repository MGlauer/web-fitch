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
        [["P(a, a, b)","a=f(b)"], "P(a, f(b), b)"],
        [["P(a, a, f(b))","a=f(b)"], "P(a, a, a)"],
        [["P(a, a, f(b))","a=f(b)"], "P(a, f(b), a)"],
        [["P(a, a, f(b))","f(a)=b"], "P(a, a, f(f(a)))"],
    ]
    ruleTestWithParser(IdentityElim, testcases)
});

const invalidTestcases = [
        [["P(a)","a=b"], "P(c)"],
        [["~P(a)","a=b"], "~P(c)"],
        [["~P(a)","a=b"], "P(a)"],
        [["P(a, b)","a=b"], "P(c, c)"],
        [["~P(a, b)","a=b"], "P(a, a)"],
        [["P(a, a, f(b))","a=f(b)"], "P(a, f(a), f(b))"],
        [["P(a, a, f(b))","a=f(b)"], "P(a, a, f(a))"],
]

invalidRuleTestWithParser(IdentityElim, invalidTestcases)