import { describe, it, expect } from "vitest";
import { PropAtoms, BinaryOp, BinarySentence} from "../../src/fitch/structure.js";
import { ConjunctionIntro } from "../../src/fitch/rules.js";

describe("simple conjunction introduction", () => {
    const a1 = new PropAtoms("A"), a2 = new PropAtoms("B"), a3 = new PropAtoms("C")
    const testcases = [
        [a1, a2],
        [a1, new BinarySentence(a2,BinaryOp.AND,a3)],
        [new BinarySentence(a1,BinaryOp.AND,a2), a3]
    ]
    for(const [a,b] of testcases){
        it(`${a.text}, ${b.text} |- ${a.text} & ${b.text}`, () => {
            expect(()=>ConjunctionIntro._check([a,b],new BinarySentence(a,BinaryOp.AND,b))).not.toThrowError();
        });
    }

});