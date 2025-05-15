import {describe, expect, it} from "vitest";
import {RuleError, Assumption} from "../../src/fitch/rules.js";
import {Justification, SentenceLine} from "../../src/fitch/proofstructure.js";

function constructLine([text, rule, refs], level){
    console.log([text, rule, refs, rule === Assumption])
    let jus = new Justification(rule, {processed:refs})
    return new SentenceLine(text, jus, level, rule === Assumption)
}


function constructProof(proof, level){
    let lines = []
    for(const linOrSub of proof){
        if(linOrSub[0] instanceof Array) {
            const subproof = constructProof(linOrSub,level + 1)
            lines = lines.concat(subproof)
        } else {
            const line= constructLine(linOrSub, level)
            lines.push(line)
        }
    }
    return lines
}


export function validProofTest([premises, proofLines]){
    const premisesEnd = premises.length

    let proof = constructProof(premises.concat(proofLines), 0)
    describe(`invalid {${proof.slice(0,premisesEnd).join(", ")}} |- ${proof[proof.length-1]}`, () => {
        for(let i=premisesEnd; i<proof.length; i++){
            const sentenceLine=proof[i]
            it(`${sentenceLine.sentence} ${sentenceLine.justification.rule.label} ${sentenceLine.justification.rule.lines}`, () => {
                expect(()=>sentenceLine.check(proof, i, premisesEnd)).not.toThrowError(RuleError)
            });
        }
    });

}