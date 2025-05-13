import { describe, it, expect } from "vitest";
import { PropAtoms, BinaryOp, BinarySentence} from "../../src/fitch/structure.js";
import {ConditionalElim, ConjunctionIntro} from "../../src/fitch/rules.js";
import {invalidRuleTestWithParser, ruleTestWithParser,} from "./base.js";

describe("simple conjunction introduction", () => {
    const a1 = new PropAtoms("A"), a2 = new PropAtoms("B"), a3 = new PropAtoms("C"), a4 = new PropAtoms("D")
    const testcases = [
        [a1, a2],
        [a1, new BinarySentence(a2,BinaryOp.AND,a3)],
        [new BinarySentence(a1,BinaryOp.AND,a2), a3],
        [new BinarySentence(a1,BinaryOp.AND,a2), new BinarySentence(a3,BinaryOp.AND,a4)],
        [new BinarySentence(new BinarySentence(a1,BinaryOp.AND,a2),BinaryOp.AND,a3), a4],
        [a1, new BinarySentence(new BinarySentence(a2,BinaryOp.AND,a3),BinaryOp.AND,a4)]
    ]
    for(const [a,b] of testcases){
        it(`${a.text}, ${b.text} |- ${a.text}${BinaryOp.AND}${b.text}`, () => {
            expect(()=>ConjunctionIntro._check([a,b],new BinarySentence(a,BinaryOp.AND,b))).not.toThrowError();
        });
    }
});

// Negative tests

const faultyCases = [
    [["A","A"], "A&B"],
    [["A","C"], "A&B"],
    [["C","B"], "A&B"],
    [["A","B"], "C&B"],
    [["A","B"], "A&C"],
    [[], "A"],
]
invalidRuleTestWithParser(ConjunctionIntro, faultyCases)


