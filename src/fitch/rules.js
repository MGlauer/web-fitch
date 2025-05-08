import {BinaryOp, BinarySentence, Falsum, Sentence, UnaryOp, UnarySentence} from './structure.js'

function getSubproof(proofLines, start, end) {
    let buffer = [];
    if(!proofLines[start].isAssumption)
        throw new RuleError("First line of subproof reference should be the start of the subproof")
    for (let i = start; i < proofLines.length; i++) {
        const line = proofLines[i]
        if (buffer.length > 0 && ((line.isAssumption && buffer[0].level === line.level) ||  (buffer[0].level > line.level))){
            if(i-1 !== end)
                throw new RuleError(`Subproof starting at line ${start} ended before line ${end}`)
            return buffer.map((x) => x.sentence)
        }
        buffer.push(proofLines[i])
    }
    if(proofLines.length - 1 !== end)
        throw new RuleError(`Subproof starting at line ${start} ended before line ${end}`)
    return buffer.map((x) => x.sentence)
}

function isAvailable(lines, referencedLineIndex, targetLineIndex){
    const referencedLine = lines[referencedLineIndex];
    const layer = referencedLine.level;
    for(let i=referencedLineIndex; i<lines.length; i++){
        const li = lines[i]
        if (li.level < layer || ((layer === li.level) && li.isAssumption)) {
            return false
        }
        if(i === targetLineIndex)
            return true
    }
    return false
}

function resolveReference(proofLines, reference, target_line){
    if(reference instanceof Array) {
        if (!isAvailable(proofLines, reference[0], target_line))
            throw new RuleError(`Subproof [${reference[0]+1},${reference[1]+1}] is not available in line ${target_line+1}`)
        return getSubproof(proofLines, reference[0], reference[1])
    } else {
        if (!isAvailable(proofLines, reference, target_line))
            throw new RuleError(`Line ${reference+1} is not available in line ${target_line+1}`)
        return proofLines[reference].sentence
    }
}



export class Rule {
    static derived = [];
    static label = "";

    static check(proof, lines, target, target_line) {

        try{
            if(!lines){
                throw new RuleError("No referenced lines")
            }
            this._check(lines.map((x) => resolveReference(proof, x, target_line)), target)
        } catch (error) {
            if(error instanceof RuleError){
                error.message =  `[ERROR applying ${this.label} to lines ${lines?lines.map((x)=>x+1).join(','):lines}]: ${error.message}`
            }
            throw error
        }
    }

    static _check(references, target) {
        throw new Error("Not implemented")
    }
}

export class RuleError extends Error {

}


export function register(obj) {
    obj.id = Rule.derived.length;
    Rule.derived[obj.label] = obj;
}

export function getLine(lines, i) {
    return lines[i].sentence
}

export function getSubProof(lines, i, j) {
    return lines.slice(i, j).map((x) => x.sentence);
}

///////////////////////
//
///////////////////////





function assertSubproof(ref){
    if (!(ref instanceof Array)){
        throw new RuleError(`Expected reference to be subproof (reference of the form 'j-k'), found ${ref}`)
    }
}

function assertLine(ref){
    if (!(ref instanceof Sentence)){
        throw new RuleError(`Expected reference to be single line, found ${ref}`)
    }
}


export class Assumption extends Rule {
    static label = "Assumption";
    static {
        register(this);
    }

    static _check(references, target) {
    }
}

// Reit: Reiteration of line
export class Reiteration extends Rule {

    static label = "Reit";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError('Rule must be applied to one line.');
        }
        let b = references[0];
        if (!target.equals(b)) {
            throw new RuleError('The formula being derived must be the same as the formula on the rule line.');
        }
    }
}

// &I: Conjunction Introduction
export class ConjunctionIntro extends Rule {
    static label = "\u2227-Intro";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length < 2) {
            throw new RuleError('Rule must be applied to at least two lines.');
        }

        if ((!(target instanceof BinarySentence)) || (target.op !== BinaryOp.AND)) {
            throw new RuleError('The formula being derived must be a conjunction.');
        }

        let conjuncts = target.associativeParts;


        for(const r of references){
            let candidates = [];
            if(r.isAssociative)
                candidates = r.associativeParts
            else
                candidates = [r]
            assertLine(r)
            for(const can of candidates) {
                const idx = conjuncts.findIndex((x) => can.equals(x))
                if (idx === undefined)
                    throw new RuleError(`${r} is not a conjunct of the formula being derived.`);
                conjuncts.splice(idx, 1)
            }
        }

        if (conjuncts.length > 0) {
            throw new RuleError(`Some conjuncts were not found: ${conjuncts.map((x) => x.text)}`);
        }
    }
}

// &E: Conjunction Elimination
export class ConjunctionElim extends Rule {
    static label = "\u2227-Elim";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError('Rule must be applied to one line.');
        }

        const a = references[0]
        assertLine(a)

        if (!(a instanceof BinarySentence) || a.op !== BinaryOp.AND) {
            throw new RuleError(`The formula ${a} must be a conjunction.`);
        }

        if (!(a.contains(target))) {
            throw new RuleError(`The formula ${target.text} must be a conjunct of ${a.text}`);
        }
    }
}




// >I: Conditional Introduction
export class ConditionalIntro extends Rule {
    static label = "\u2192-Intro";
    static {
        register(this);
    }

    static _check(references, target) {
        if (!(references.length === 1)) {
            throw new RuleError('Rule must be applied one subproof.');
        }

        const sub = references[0]
        assertSubproof(sub)

        const a = sub[0] // Assumption
        const c = sub[sub.length-1] // Consequent

        if (!(target instanceof BinarySentence) || target.op !== BinaryOp.IMPL) {
            throw new RuleError('The target formula being derived must be a conditional.');
        }

        if (!target.left.equals(a)) {
            throw new RuleError('The assumption on the first rule line must be the antecedent of the conditional being derived.');
        }
        if (!target.right.equals(c)) {
            throw new RuleError('The second rule line must be the consequent of the conditional being derived.');
        }
    }
}

// >E: Conditional Elimination
export class ConditionalElim extends Rule {

    static label = "\u2192-Elim";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 2) {
            throw new RuleError('Rule must be applied to two lines.');
        }

        const [a, b] = references;
        assertLine(a);
        assertLine(b);

        if (!(a instanceof BinarySentence) || a.op !== BinaryOp.IMPL) {
            throw new RuleError("The first rule line must be a conditional. (Remember: cite the line of the conditional first, the line of its antecedent second.)");
        }
        if (!a.left.equals(b)) {
            throw new RuleError("The second rule line must be the antecedent of the conditional on the first rule line. (Remember: cite the line of the conditional first, the line of its antecedent second.)");
        }
        if (!a.right.equals(target)) {
            throw new RuleError("The formula being derived must be the consequent of the conditional on the first rule line.");
        }
    }
}

// vI: Disjunction Introduction
export class DisjunctionIntro extends Rule {

    static label = "\u2228-Intro";
    static {
        register(this);
    }

    static _check(references, target) {

        if (references.length !== 1) {
            throw new RuleError("Rule must be applied to one line");
        }

        const a = references[0];
        assertLine(a);

        if (!(target instanceof BinarySentence) || target.op !== BinaryOp.OR) {
            throw new RuleError("The formula being derived must be a disjunction.");
        }

        if (!target.contains(a)) {
            throw new RuleError(`The formula ${a.text} must be a disjunct of the formula being derived.`);
        }
    }
}

// vE: Disjunction Elimination
export class DisjunctionElim extends Rule {

    static label = "\u2228-Elim";
    static {
        register(this);
    }

    static _check(references, target) {

        if (references.length<2) {
            throw new RuleError("Rule must be applied to a disjunction line and a pair of subproofs (with subproof citations of the form j-k).");
        }

        const dis = references[0]
        if (!(dis instanceof BinarySentence) || dis.op !== BinaryOp.OR) {
            throw new RuleError("The first referenced line must be a disjunction.");
        }

        const subproofs = references.slice(1)
        const cases = dis.associativeParts

        for(const sp of subproofs){
            assertSubproof(sp)
            const assumption = sp[0]
            const consequence = sp[sp.length-1]
            if(!consequence.equals(target)){
                throw new RuleError(`Subproof has last line ${consequence.text}, which is not the target`)
            }
            const idx = cases.findIndex((x)=>assumption.equals(x))
            if(idx === -1){
                // Todo: Can we just ignore this case?
                throw new RuleError(`Subproof has assumption ${assumption.text}, which is not a disjunct in ${dis.text}`)
            }
            cases.splice(idx, 1);
        }

        if(cases.length !== 0)
            throw new RuleError(`Some cases have not been found as assumptions in subproofs: ` + cases.map((x) => x.text))
    }
}

// ~I: Negation Introduction
export class NegationIntro extends Rule {

    static label = String.fromCharCode(172) + "-Intro";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError("Rule must be applied to one subproof (citation of the form j-k).");
        }

        const sub = references[0]
        assertSubproof(sub)

        const a = sub[0]
        const c = sub[sub.length-1]

        if (!(c instanceof Falsum)) {
            throw new RuleError("The last line of the subproof must be the absurdity (\u22A5).");
        }

        if (!(target instanceof UnarySentence && target.op === UnaryOp.NEG && target.right.equals(a))) {
            throw new RuleError("The formula being derived must be the negation of the assumption on the first rule line.");
        }

    }
}

// ~E: Negation Elimination (formerly Double Negation Elimination)
export class NegationElim extends Rule {

    static label = String.fromCharCode(172) + "-Elim";
    static {
        register(this);
    }
    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError("Rule must be applied to one line.");
        }

        const a = references[0]
        assertLine(a)

        if (!(
            (a instanceof UnarySentence) && (a.op === UnaryOp.NEG)
            && (a.right instanceof UnarySentence) && (a.right.op === UnaryOp.NEG)
            && (a.right.right.equals(target)))
        ) {
            throw new RuleError("Referenced formula must be the double negation of the formula being derived.");
        }
    }
}

// #I: Falsum/Absurdity Introduction (formerly Negation Elimination)
export class FalsumIntro extends Rule {

    static label = "\u22A5-Intro";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 2) {
            throw new RuleError("Rule must be applied to two lines.");
        }

        const [a,b] = references
        assertLine(a)
        assertLine(b)

        if (!(target instanceof Falsum)) {
            throw new RuleError("The formula being derived must be the absurdity.");
        }

        if (!((b instanceof UnarySentence) && b.op === UnaryOp.NEG && b.right.equals(a))) {
            throw new RuleError(`Second referenced line must be the negation of the first referenced line.`);
        }
    }
}



// EFQ: Ex Falso Quodlibet
export class FalsumElim extends Rule {

    static label = "\u22A5-Elim";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError("Rule must be applied to one line.");
        }

        const a = references[0]

        if (!(a instanceof Falsum)) {
            throw new RuleError("Referenced line must be the absurdity (\u22A5).");
        }
    }
}

// <>I: Biconditional Introduction
export class BiconditionalIntro extends Rule {

    static label = "\u2194-Intro";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 2) {
            throw new RuleError("Rule must be applied to two subproofs (citations of the form j-k).");
        }

        const [sub1, sub2] = references;
        assertSubproof(sub1)
        assertSubproof(sub2)

        const a1 = sub1[0]
        const c1 = sub1[sub1.length-1]
        const a2 = sub2[0]
        const c2 = sub2[sub2.length-1]

        if (!((target instanceof BinarySentence) && target.op === BinaryOp.BIMPL)) {
            throw new RuleError("The formula being derived must be a biconditional.");
        }

        if (!(a2.equals(c1) && a1.equals(c2))) {
            throw new RuleError("The assumption of one subproof must the conclusion of the other.");
        }

        if (!(target.left.equals(a1) && target.right.equals(a2)) && !(target.left.equals(a2) && target.right.equals(a1)) ) {
            throw new RuleError("The biconditional being derived must be composed of the formulas on the rule lines.");
        }
    }
}

//<>E: Biconditional Elimination
export class BiconditionalElim extends Rule {

    static label = "\u2194-Elim";
    static {
        register(this);
    }

    static _check(references, target) {
        if (references.length !== 2) {
            throw new RuleError("Rule must be applied to two lines.");
        }

        const [a, b] = references;
        assertLine(a);
        assertLine(b);

        if (!(a instanceof BinarySentence) || a.op !== BinaryOp.BIMPL) {
            throw new RuleError("The formula on the first rule line must be a biconditional.");
        }
        if (!((a.left.equals(b) && a.right.equals(target)) || (a.left.equals(target) && a.right.equals(b)))) {
            throw new RuleError("The left-hand or the right-hand side of the biconditional must match the referenced line.");
        }
    }
}

/*
//!E: Universal Elimination
export class UniversalElim extends Rule {
    static {
        register(this);
    }
    static label = "\u2200-Elim";

    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError("Rule must be applied to a single lines.");
        }

        const sub = references[0];
        assertSubproof(sub)
        const a = sub[0]

    }
}*/