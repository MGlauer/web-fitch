import { describe, it, expect } from "vitest";
import { parse } from "../../src/fitch/structure.js";
import { DisjunctionIntro } from "../../src/fitch/rules.js";

describe("disjunction introduction with parsing", () => {
    const testcases = [
            [["A"], "~A|A"],
            [["A"], "A|~A"]
    ]
    for(const [references,target] of testcases){
        it(`{${references.join(", ")}} |- ${target}`, () => {
            expect(()=>DisjunctionIntro._check(references.map(parse), parse(target))).not.toThrowError()
        });
    }
});