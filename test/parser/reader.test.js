import {describe, expect, it} from "vitest";
import {parse, Atom, PropAtoms, Constant, BinarySentence, BinaryOp} from "../../src/fitch/structure.js";


const
    A = new PropAtoms("A"),
    B = new PropAtoms("B"),
    C = new PropAtoms("C"),
    and = (x,y) => new BinarySentence(x, BinaryOp.AND, y),
    or = (x,y) => new BinarySentence(x, BinaryOp.OR, y),
    lif = (x,y) => new BinarySentence(x, BinaryOp.IMPL, y),
    liff = (x,y) => new BinarySentence(x, BinaryOp.BIMPL, y)

const cases = [
    ["A", A],
    ["P(a)", new Atom("P", [new Constant("a")])],
    ["A&B", and(A,B)],
    ["A|B", or(A,B)],
    ["A>B", lif(A,B)],
    ["A<>B", liff(A,B)],
    ["A&(B&C)", and(A,and(B,C))],
]

describe(`Reader test`, () => {
    for(const [string, structure] of cases) {
        it(`Roundtrip ${string} should be ${structure.text}`, () => {
            expect(parse(string).equals(structure)).equals(true);
        });
    }
})
