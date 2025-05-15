import {describe, expect, it} from "vitest";
import {parse, FunctionTerm, PropAtoms, Constant} from "../../src/fitch/structure.js";
const wrongParsings = [
    ["P(a)", new FunctionTerm("P", [new Constant("a")])],
]

describe(`Negative reader test`, () => {
    for(const [string, structure] of wrongParsings) {
        it(`Roundtrip ${string} should not be ${structure.text}`, () => {
            expect(parse(string).equals(structure)).equals(false);
        });
    }
})

const faultyIput = [
    "f(a)",
    "a",
    "x",
    "A|B&C"
]

describe(`Invalid reader test`, () => {
    for(const string of faultyIput) {
        it(`Roundtrip ${string} should not parse`, () => {
            expect(() => parse(string)).toThrowError(SyntaxError);
        });
    }
})