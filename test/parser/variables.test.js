import {describe, expect, it} from "vitest";
import {parse, } from "../../src/fitch/structure.js";


const faultyInput = [
    "P(x)",
    "!xP(x) & Q(x)",
]

describe(`Invalid reader test`, () => {
    for(const string of faultyInput) {
        it(`${string} should not parse`, () => {
            expect(() => parse(string)).toThrowError(SyntaxError);
        });
    }
})