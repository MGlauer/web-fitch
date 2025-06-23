import {describe, expect, it} from "vitest";
import {
    parse,
    Atom,
    PropAtoms,
    Constant,
    BinarySentence,
    BinaryOp,
    QuantifiedSentence, Quantor, UnarySentence, UnaryOp, Variable
} from "../../src/fitch/structure.js";


const
    A = new PropAtoms("A"),
    B = new PropAtoms("B"),
    C = new PropAtoms("C"),

    and = (x,y) => new BinarySentence(x, BinaryOp.AND, y),
    or = (x,y) => new BinarySentence(x, BinaryOp.OR, y),
    lif = (x,y) => new BinarySentence(x, BinaryOp.IMPL, y),
    liff = (x,y) => new BinarySentence(x, BinaryOp.BIMPL, y),
    not = (x) => new UnarySentence(UnaryOp.NEG, x),
    all = (v,x) => new QuantifiedSentence(Quantor.ALL, v, x),
    ex = (v,x) => new QuantifiedSentence(Quantor.Ex, v, x),
    P = ([...xs]) => new Atom("P", xs),
    x = new Variable("x")


const cases = [
    ["A", A],
    ["P(a)", new Atom("P", [new Constant("a")])],
    ["A&B", and(A,B)],
    ["A|B", or(A,B)],
    ["A>B", lif(A,B)],
    ["A<>B", liff(A,B)],
    ["A&(B&C)", and(A,and(B,C))],
    ["A&(B|C)", and(A,or(B,C))],
    ["A|(B&C)", or(A,and(B,C))],
    ["A|(B|C)", or(A,or(B,C))],
    ["~?xP(x)", not(ex(x.name,P([x])))]
]

describe(`Reader test`, () => {
    for(const [string, structure] of cases) {
        it(`Roundtrip ${string} should be ${structure.text}`, () => {
            expect(parse(string).equals(structure)).equals(true);
        });
    }
})
