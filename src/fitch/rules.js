import {
    Atom,
    BinaryOp,
    BinarySentence,
    Falsum,
    Sentence,
    UnaryOp,
    UnarySentence,
    QuantifiedSentence,
    Quantor,
    Constant,
    Variable,
    LatexBinaryOp,
    LatexUnaryOp,
    LatexQuantor
} from './structure.js'

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

function isAvailable(lines, referencedLineIndex, targetLineIndex, premiseEnd){
    if(referencedLineIndex < 0)
        return false
    if(!(referencedLineIndex instanceof Array) && referencedLineIndex < premiseEnd)
        return true
    if(targetLineIndex >= lines.length || referencedLineIndex ===targetLineIndex)
        return false
    let availablePerLayer = [[]]
    for(let i=premiseEnd; i<=targetLineIndex; i++){
        const li = lines[i]
        if(li.isAssumption){
            if(availablePerLayer.length-1 < li.level){ // A new, lower subproof
                availablePerLayer.push([i])
            } else {
                while(li.level <= availablePerLayer.length-1){
                    const finishedSubproof = availablePerLayer.pop()
                    availablePerLayer[availablePerLayer.length-1].push([finishedSubproof[0],finishedSubproof[finishedSubproof.length-1]])
                } // This subproof is now available
                availablePerLayer.push([i])
            }
        } else {
            while(li.level < availablePerLayer.length-1){
                const finishedSubproof = availablePerLayer.pop()
                availablePerLayer[availablePerLayer.length-1].push([finishedSubproof[0],finishedSubproof[finishedSubproof.length-1]])
            }
            availablePerLayer[availablePerLayer.length-1].push(i)
        }
    }
    return availablePerLayer.flat().some((x)=>referenceEquals(x, referencedLineIndex))
}

function referenceEquals(r1,r2){
    if((r1 instanceof Array) !== (r2 instanceof Array))
        return false
    if(r1 instanceof Array)
        return r1.every((x,i) => x === r2[i])
    else
        return r1 === r2
}

function resolveReference(proofLines, reference, target_line, premiseEnd){
    if(reference instanceof Array) {
        if (!isAvailable(proofLines, reference, target_line, premiseEnd))
            throw new RuleError(`Subproof [${reference[0]+1},${reference[1]+1}] is not available in line ${target_line+1}`)
        return getSubproof(proofLines, reference[0], reference[1])
    } else {
        if (!isAvailable(proofLines, reference, target_line, premiseEnd))
            throw new RuleError(`Line ${reference+1} is not available in line ${target_line+1}`)
        return proofLines[reference].sentence
    }
}


function findConstantIntro(proofLines, references, premiseEnd){
    let intros = []
    for(const reference of references) {
        if (reference instanceof Array) {
            const c = proofLines[reference[0]].newConstant
            if(c !== null)
                for(let i = 0; i<reference[0]; i++){
                    if(isAvailable(proofLines, i, reference[0], premiseEnd) && proofLines[i].sentence.constants.has(c))
                        throw new RuleError("Constant introduced in subproof must be new.")
                }
                intros.push(c)
        }
    }
    if(new Set(intros).size > 1)
        throw RuleError("Too many constant introductions")
    return intros[0]
}


function printLines(lines){
    let parts = []
    for(const l of lines){
        if(l instanceof Array)
            parts.push(`${l[0]+1}-${l[1]+1}`)
        else
            parts.push(`${l+1}`)
    }
    return parts.join(",")
}

class Rule {
    static derived = [];
    static operator = "";
    static type = "";

    static get label(){
        return `${this.operator}-${this.type}`
    };

    static get latex(){
        return this.label
    }

    static check(proof, lines, target, target_line, premiseEnd) {
        const targetSentenceLine = proof[target_line]
        try{
            if((lines == null || lines.length === 0) && !(targetSentenceLine.justification.rule === IdentityIntro) && !(targetSentenceLine.justification.rule === Assumption)){
                throw new RuleError("No referenced lines")
            }
            targetSentenceLine.justification.rule._check(lines.map((x) => resolveReference(proof, x, target_line, premiseEnd)), target, findConstantIntro(proof, lines, premiseEnd))
        } catch (error) {
            if(error instanceof RuleError){
                error.message =  `[ERROR applying ${targetSentenceLine.justification.rule.label} to lines ${lines?printLines(lines):lines}]: ${error.message}`
            }
            throw error
        }
    }

    static _check(references, target) {
        throw new Error("Not implemented")
    }
}

class BinaryRule extends  Rule{
    static get latex(){
        return `${LatexBinaryOp.get(this.operator)}-${this.type}`
    }
}

class UnaryRule  extends  Rule{
    static get latex(){
        return `${LatexUnaryOp.get(this.operator)}-${this.type}`
    }
}

class QuantorRule extends  Rule {
    static get latex(){
        return `${LatexQuantor.get(this.operator)}-${this.type}`
    }
}

class PureRule extends  Rule {
    static get latex(){
        return `${this.operator}-${this.type}`
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


function onlyUniqueSubs(value, index, array) {
    for(let i=0; i<array.length; i++){
        if(i!==index && array[i][0] === value[0]&& array[i][1] === value[1])
            return false
    }
    return true
}


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
    static type = "Assumption"


    static _check(references, target) {
    }
}

export class ExistenceIntro extends QuantorRule {
    static operator = Quantor.EX
    static type = "Intro"
    

    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError('Rule must be applied to one line.');
        }

        const quantSen = target;

        if (!(quantSen instanceof QuantifiedSentence)) {
            throw new RuleError('The formula being derived must be a quantified sentence.');
        }

        if(!(quantSen.quant === Quantor.EX)){
            throw new RuleError('The formula being derived must have an existence quantifier.');
        }

        const s = "The referenced formula does not match the derived formula: "

        const rawSubs = quantSen.right.unify(references[0])
        if(rawSubs === null)
            throw new RuleError(s + "The formulas do not follow the same pattern.")
        const subs = rawSubs.filter(onlyUniqueSubs);

        if(subs.length > 1)
            throw new RuleError(s + "Found too many substitutions when trying to substitute derived formula")
        else{
            if(subs.length === 1){
                if (subs[0][0] !== quantSen.variable)
                    throw new RuleError(s + `Wrong variable found when trying to substitute derived formula (found: ${subs[0][0]}, expected: ${quantSen.variable})`)
                const newSen = quantSen.right.substitute(new Variable(quantSen.variable), new Constant(subs[0][1]))
                if (!newSen.equals(references[0]))
                    throw new RuleError(s + `Reference cannot be derived from target line`)
            }
        }
    }

}

export class IdentityElim extends PureRule {
    static operator = "\u003D"
    static type = "Elim"
    

    static _check(references, target){
        if(references.length !== 2){
            throw new RuleError("Identity elimination must reference two lines.")
        }

        let att = references[0];
        let idIntro = references[1];

        if(!(idIntro.predicate === "=")){
            throw new RuleError("Second reference should be identity atom.")
        }

        if(!att.equalModuloSubstitution(target, [[idIntro.terms[0],idIntro.terms[1]],[idIntro.terms[1],idIntro.terms[0]]])){
            throw new RuleError("Wrong formula derived.");
        }

    }
}

// Id: Identity of variable
export class IdentityIntro extends PureRule {
    static operator = "\u003D"
    static type = "Intro"
    

    static _check(references, target){
        if(references.length > 0){
            throw new RuleError("Identity intro cannot have any lines.")
        }

        if(!(target instanceof Atom) || (target.predicate !== "=")){
            throw new RuleError("Formula being derived must be an identity.")
        }

        if(!(target.terms[0].equals(target.terms[1]))){
            throw new RuleError("Left hand side does not equal right hand side.")
        }
    }
}

export class ExistsElim extends QuantorRule {

    static operator = Quantor.EX
    static type = "Elim"
    

    static _check(references, target, introducedConstant) {
        if (references.length !== 2) {
            throw new RuleError('Rule must be applied to exactly one line and one subproof.');
        }

        if(references[0] instanceof Array)
            throw new RuleError('Second reference must be a single line.');

        if(!(references[1] instanceof Array))
            throw new RuleError('Second reference must be a subproof.');

        const exLine = references[0];
        const subproof = references[1];
        const assumption = subproof[0];
        const lastLine = subproof[subproof.length - 1];

        if (!(exLine instanceof QuantifiedSentence) || !(exLine.quant === Quantor.EX)) {
            throw new RuleError('The formula being derived must be a existentially quantified sentence.');
        }

        const s = "The referenced formula does not match the referenced formula when replacing all variables: "
        const rawSubs = exLine.right.unify(assumption)
        if(rawSubs === null)
            throw new RuleError(s + "The last line of subproof and target do not follow the same pattern.")
        const subs = rawSubs.filter(onlyUniqueSubs);

        if(subs.length > 1)
            throw new RuleError(s + "Too many substitutions")
        else{
            if(subs.length === 1) {
                if (subs[0][0] !== exLine.variable)
                    throw new RuleError(s + `Wrong variable in substitution (found: ${subs[0][0]}, expected: ${target.variable})`)
                if (introducedConstant !== subs[0][1])
                    throw new RuleError(`Substitution does not match introduced constant (found: ${subs[0][1]}, expected: ${introducedConstant})`)

            }
        }
        if (!exLine.right.substitute(new Variable(exLine.variable), new Constant(introducedConstant)).equals(assumption))
            throw new RuleError(`Target cannot be derived from referenced line`)
        if(lastLine.constants.has(introducedConstant))
            throw new RuleError(`Constant introduced in subproof must not be present in last line.`)
        if(!lastLine.equals(target))
            throw new RuleError(`Last line of subproof must match target`)
    }
}

export class AllIntro extends QuantorRule {

    static operator = Quantor.ALL
    static type = "Intro"
    

    static _check(references, target, introducedConstant) {
        if (references.length !== 1 && references[0] instanceof Array) {
            throw new RuleError('Rule must be applied to exactly one subproof.');
        }

        const subproof = references[0];

        if (!(target instanceof QuantifiedSentence) || !(target.quant === Quantor.ALL)) {
            throw new RuleError('The formula being derived must be a universally quantified sentence.');
        }

        const s = "The derived formula does not match the referenced formula when replacing all variables: "
        const lastLine = subproof[subproof.length - 1];

        if(subproof[0].text !== "")
            throw new RuleError("Subproof must not make any assumptions.")

        const rawSubs = target.right.unify(lastLine)
        if(rawSubs === null)
            throw new RuleError(s + "The last line of subproof and target do not follow the same pattern.")
        const subs = rawSubs.filter(onlyUniqueSubs);

        if(subs.length > 1)
            throw new RuleError(s + "Too many substitutions")
        else{
            if(subs.length === 1){
                if (subs[0][0] !== target.variable)
                    throw new RuleError(s + `Wrong variable in substitution (found: ${subs[0][0]}, expected: ${target.variable})`)
                if(introducedConstant !== subs[0][1])
                    throw new RuleError(`Substitution does not match introduced constant (found: ${subs[0][1]}, expected: ${introducedConstant})`)
                if (!target.right.substitute(new Variable(target.variable), new Constant(subs[0][1])).equals(lastLine))
                    throw new RuleError(s + `Target cannot be derived from referenced line`)
            }
        }

        if(target.constants.has(introducedConstant))
            throw new RuleError(`Target line must not contain local constant ${introducedConstant}.`)
    }
}

export class AllElim extends QuantorRule {

    static operator = Quantor.ALL
    static type = "Elim"
    

    static _check(references, target) {
        if (references.length !== 1) {
            throw new RuleError('Rule must be applied to one line.');
        }

        const quantSen = references[0];

        if (!(quantSen instanceof QuantifiedSentence)) {
            throw new RuleError('The formula being referenced must be a quantified sentence.');
        }

        if(!(quantSen.quant === Quantor.ALL)){
            throw new RuleError('The formula being referenced must have an universal quantifier.');
        }

        const s = "The derived formula does not match the referenced formula when replacing all variables: "

        const rawSubs = quantSen.right.unify(target)
        if(rawSubs === null)
            throw new RuleError(s + "The formulas do not follow the same pattern.")
        const subs = rawSubs.filter(onlyUniqueSubs);

        if(subs.length > 1)
            throw new RuleError(s + "Too many substitutions")
        else{
            if(subs.length === 1){
                if (subs[0][0] !== quantSen.variable)
                    throw new RuleError(s + `Wrong variable in substitution (found: ${subs[0][0]}, expected: ${quantSen.variable})`)
                const newSen = quantSen.right.substitute(new Variable(quantSen.variable), new Constant(subs[0][1]))
                if (!newSen.equals(target))
                    throw new RuleError(s + `Target cannot be derived from referenced line`)
            }
        }
    }
}

// Reit: Reiteration of line
export class Reiteration extends Rule {

    static type = "Reit"


    static get label(){
        return "Reit"
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
export class ConjunctionIntro extends BinaryRule {
    static operator = BinaryOp.AND
    static type = "Intro"
    

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
            if(r.isAssociative  && r.op === target.op)
                candidates = r.associativeParts
            else
                candidates = [r]
            assertLine(r)
            for(const can of candidates) {
                const idx = conjuncts.findIndex((x) => can.equals(x))
                if (idx === undefined || idx === -1)
                    throw new RuleError(`${r} is not a conjunct of the formula being derived or has already been used.`);
                conjuncts.splice(idx, 1)
            }
        }

        if (conjuncts.length > 0) {
            throw new RuleError(`Some conjuncts were not found: ${conjuncts.map((x) => x.text)}`);
        }
    }
}

// &E: Conjunction Elimination
export class ConjunctionElim extends BinaryRule {
    static operator = BinaryOp.AND
    static type = "Elim"
    

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
export class ConditionalIntro extends BinaryRule {
    static operator = BinaryOp.IMPL
    static type = "Intro"
    

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
export class ConditionalElim extends BinaryRule {

    static operator = BinaryOp.IMPL
    static type = "Elim"
    

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
export class DisjunctionIntro extends BinaryRule {

    static operator = BinaryOp.OR
    static type = "Intro"
    

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
export class DisjunctionElim extends BinaryRule {

    static operator = BinaryOp.OR
    static type = "Elim"
    

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

            let parts = []
            if((assumption instanceof BinarySentence) && (assumption.op === BinaryOp.OR))
                parts = assumption.associativeParts
            else
                parts = [assumption]

            for(const p of parts) {
                const idx = cases.findIndex((x)=>p.equals(x))
                if (idx === -1) {
                    // Todo: Can we just ignore this case?
                    throw new RuleError(`Subproof has assumption ${p.text}, which is not a disjunct in ${dis.text}`)
                }
                cases.splice(idx, 1);
            }
        }

        if(cases.length !== 0)
            throw new RuleError(`Some cases have not been found as assumptions in subproofs: ` + cases.map((x) => x.text))
    }
}

// ~I: Negation Introduction
export class NegationIntro extends UnaryRule {

    static operator = UnaryOp.NEG
    static type = "Intro"
    

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
export class NegationElim extends UnaryRule {

    static operator = UnaryOp.NEG
    static type = "Elim"
    
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
export class FalsumIntro extends PureRule {

    static operator = "\u22A5"
    static type = "Intro"
    

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

        if (!(((b instanceof UnarySentence) && b.op === UnaryOp.NEG && b.right.equals(a)) ||
              ((a instanceof UnarySentence) && a.op === UnaryOp.NEG && a.right.equals(b)))) {
            throw new RuleError(`Second referenced line must be the negation of the first referenced line.`);
        }
    }
}



// EFQ: Ex Falso Quodlibet
export class FalsumElim extends PureRule {

    static operator = "\u22A5"
    static type = "Elim"


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
export class BiconditionalIntro extends BinaryRule {

    static operator = BinaryOp.BIMPL
    static type = "Intro"


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
export class BiconditionalElim extends BinaryRule {

    static operator = BinaryOp.BIMPL
    static type = "Elim"
    

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

export const introRules = new Map([ConjunctionIntro, DisjunctionIntro, NegationIntro, ConditionalIntro, BiconditionalIntro, FalsumIntro, IdentityIntro, ExistenceIntro, AllIntro].map((x)=> [x.label,x]));
export const elimRules = new Map([ConjunctionElim, DisjunctionElim, NegationElim, ConditionalElim, BiconditionalElim, FalsumElim, IdentityElim, ExistsElim, AllElim].map((x)=>[x.label,x]))
export const miscRules = new Map([Reiteration].map((x)=>[x.label,x]))
export const rules = new Map([...introRules, ...elimRules, ...miscRules])