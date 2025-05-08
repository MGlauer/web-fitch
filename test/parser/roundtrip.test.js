import { describe, it, expect } from "vitest";
import {parse} from "../../src/fitch/structure.js";
import {ConjunctionIntro} from "../../src/fitch/rules.js";
const charmap = {
    '&' : "\u2227",
    '|' : "\u2228",
    '>': "\u2192",
    '<>': "\u2194",
    '~': "\u00AC"
}
describe("simple conjunction introduction", () => {
    const texts = [
        "~(A|~A)",
    ].map((x) => x.split("").map((y) => charmap[y]??y).join(""))
    for(const text of texts) {
        it(`Roundtrip &{text}`, () => {
            expect(parse(text).text).equals(text);
        });
    }
})