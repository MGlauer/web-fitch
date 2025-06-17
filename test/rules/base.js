import {describe, expect, it} from "vitest";
import {parse} from "../../src/fitch/structure.js";
import {RuleError} from "../../src/fitch/rules.js";

function parseReference(ref){
    if(ref instanceof Array)
        return ref.map(parse)
    else
        return parse(ref)
}

export function ruleTestWithParser(rule, testcases) {
    for(let [references,target,introducedConstant=null] of testcases){
        let name = `{${references.join(", ")}} |- ${target}`
        if(introducedConstant)
            name += `intro: ${introducedConstant}`
        it( name, () => {
            expect(()=>rule._check(references.map(parseReference), parse(target),introducedConstant)).not.toThrowError()
        });
    }
}

export function invalidRuleTestWithParser(rule, testcases){
    describe(`invalid ${rule.label} with parsing`, () => {
        for(let [references,target,introducedConstant=null] of testcases){
            let name = `{${references.join(", ")}} |- ${target}`
            if(introducedConstant)
                name += `intro: ${introducedConstant}`
            it(name, () => {
                expect(()=>rule._check(references.map(parseReference), parse(target),introducedConstant)).toThrowError(RuleError)
            });
        }
    });

}