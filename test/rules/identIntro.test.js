import { describe, it, expect } from "vitest";
import {invalidRuleTestWithParser, ruleTestWithParser} from "./base.js"
import {IdentityIntro,} from "../../src/fitch/rules.js";

describe("identity introduction with parsing", () => {
    const testcases = [
        [[], "a=a"],
    ]
    ruleTestWithParser(IdentityIntro, testcases)
});

const invalidTestcases = [
    [[], "a=b"],
]

invalidRuleTestWithParser(IdentityIntro, invalidTestcases)