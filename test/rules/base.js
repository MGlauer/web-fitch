import {expect, it} from "vitest";
import {parse} from "../../src/fitch/structure.js";

function parseReference(ref){
    if(ref instanceof Array)
        return ref.map(parse)
    else
        return parse(ref)
}

export function ruleTestWithParser(rule, testcases){
    for(const [references,target] of testcases){
        it(`{${references.join(", ")}} |- ${target}`, () => {
            expect(()=>rule._check(references.map(parseReference), parse(target))).not.toThrowError()
        });
    }
}