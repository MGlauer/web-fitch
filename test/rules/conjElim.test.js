import { describe, it, expect } from "vitest";
import { PropAtoms, BinaryOp, BinarySentence} from "../../src/fitch/structure.js";
import { ConjunctionElim } from "../../src/fitch/rules.js";

describe("simple conjunction Elimination", () => {
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
        it(`${a.text}${BinaryOp.AND}${b.text} |- ${a.text}`, () => {
            expect(()=>ConjunctionElim._check([new BinarySentence(a,BinaryOp.AND,b)],a)).not.toThrowError()
        });
        it(`${a.text}${BinaryOp.AND}${b.text} |- ${b.text}`, () => {
            expect(()=>ConjunctionElim._check([new BinarySentence(a,BinaryOp.AND,b)],a)).not.toThrowError();
        });
    }
});