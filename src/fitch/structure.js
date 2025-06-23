import {parse as peggyParse, SyntaxError} from './parser.js'
import ProofLineBox from "../components/ProofLineBox.jsx";
import * as React from "react";
import {buttonGroupClasses} from "@mui/material";

export function parse(input) {
    let processed = process(peggyParse(input))
    if(processed.freeVariables.size > 0)
        throw SyntaxError("Sentences cannot have free variables")
    return processed
}

function process(input) {
    if(input==="")
        return new Sentence()
    switch (input.type) {
        case("quantSen"):
            return new QuantifiedSentence(readQuantor(input.quant), input.vari, process(input.sen))
        case("bin"):
            return new BinarySentence(process(input.left), readBinaryOp(input.op), process(input.right))
        case("un"):
            return new UnarySentence(readUnaryOp(input.op), process(input.sen))
        case("fun"):
            return new FunctionTerm(input.fun, input.terms.map((x) => process(x)))
        case("pred"):
            return new Atom(input.pred, input.terms.map((x) => process(x)))
        case("falsum"):
            return new Falsum()
        case("atom"):
            return new PropAtoms(input.const)
        case("const"):
            if(input.const.match("^[x-z][0-9]*$"))
                return new Variable(input.const)
            else
                return new Constant(input.const)
        default:
            throw Error("Unknown input: " + input)
    }
}

export class Sentence {
    constructor() {
    }

    get text() {
        return ""
    };

    equals(other) {
        return false
    }

    substitute(vari, cons) {
        return this
    }

    unify(other){
        return this
    }

    get freeVariables(){
        return new Set()
    }

    get constants(){
        return new Set()
    }

    equalModuloSubstitution(other, subs) {
        return false
    }

}

export class UnarySentence extends Sentence {
    constructor(op, right) {
        super()
        this.op = op;
        this.right = right;
    }

    get text() {
        if(this.right instanceof Atom || this.right instanceof PropAtoms || this.right instanceof UnarySentence){
            return this.op + this.right.text
        } else {
            return `${this.op}(${this.right.text})`
        }
    };

    get latex(){
        if(this.right instanceof Atom || this.right instanceof PropAtoms || this.right instanceof UnarySentence){
            return LatexUnaryOp[this.op] + this.right.text
        } else {
            return `${LatexUnaryOp.get(this.op)}(${this.right.text})`
        }
    }

    substitute(vari, cons) {
        return new UnarySentence(this.op, this.right.substitute(vari, cons))
    }

    equals(other){
        if(!(other instanceof UnarySentence))
            return false
        return (other.op === this.op) && (this.right.equals(other.right))
    }

    equalModuloSubstitution(other, subs) {
        if(!(other instanceof UnarySentence) || (other.op !== this.op))
            return false
        else
            return this.right.equalModuloSubstitution(other.right, subs)
    }
    unify(other){
        if(!(other instanceof UnarySentence) || other.op !== this.op)
            return null
        else
            return this.right.unify(other.right)
    }

    get freeVariables(){
        return this.right.freeVariables
    }


    get constants(){
        return this.right.constants
    }
}

export class QuantifiedSentence extends Sentence {
    constructor(quant, vari, right) {
        super()
        this.quant = quant;
        this.variable = vari;
        this.right = right;
    }

    get text() {
        return `${this.quant}${this.variable}(${this.right.text})`
    };

    get latex(){
        return `${LatexQuantor.get(this.quant)}${this.variable.latex}(${this.right.latex})`
    }

    substitute(vari, cons) {
        if (this.variable === vari.name) {
            // If the variable to substitute is not free, don't
            return this
        } else {
            return new QuantifiedSentence(this.quant, this.variable, this.right.substitute(vari, cons))
        }
    }

    equals(other){
        return (
            (other instanceof QuantifiedSentence) &&
            other.quant === this.quant &&
            other.variable === this.variable &&
            this.right.equals(other.right))
    }

    equalModuloSubstitution(other, subs) {
        if(!(other instanceof QuantifiedSentence) || (other.quant !== this.quant) || !other.variable.equals(this.variable))
            return false
        else
            return this.right.equalModuloSubstitution(other.right, subs)
    }

    unify(other){
        if(!(other instanceof QuantifiedSentence) || other.quant !== this.quant || other.variable !== this.variable)
            return null
        else
            return this.right.unify(other.right)
    }

    get freeVariables(){
        return new Set([...this.right.freeVariables.values()].filter((x) => x !== this.variable))
    }

    get constants(){
        return this.right.constants
    }
}

export class BinarySentence extends Sentence {
    constructor(left, op, right) {
        super()
        this.left = left;
        this.op = op;
        this.right = right;
    }

    get associativeParts() {
        if (!this.isAssociative)
            return [this]
        let res = [];
        for (const element of [this.left, this.right]) {
            if ((element instanceof BinarySentence) && (element.op === this.op))
                res = [...res, ...element.associativeParts]
            else
                res.push(element)
        }
        return res
    }

    get isAssociative() {
        return this.op === BinaryOp.AND || this.op === BinaryOp.OR
    }

    get text() {
        if(this.isAssociative)
            return this.associativeParts.map((x) => x.text).join(this.op)
        else
            return `${this.left.text}${this.op}${this.right.text}`
    }

    get latex() {
        if(this.isAssociative)
            return this.associativeParts.map((x) => x.latex).join(LatexBinaryOp[this.op])
        else
            return `${this.left.latex} ${LatexBinaryOp.get(this.op)} ${this.right.latex}`
    }

    substitute(vari, cons) {
        return new BinarySentence(this.left.substitute(vari, cons), this.op, this.right.substitute(vari, cons))
    }

    contains(other) {
        const array1 = this.associativeParts
        if (other instanceof BinarySentence && this.op === other.op) {
            const array2 = other.associativeParts
            return array2.length < array1.length && (array2.every(item => array1.find(item2 => item.equals(item2))) !== undefined)
        } else {
            return array1.find(item => item.equals(other)) !== undefined
        }
    }

    equals(other) {
        if (!(other instanceof BinarySentence))
            return false
        if (this.op != other.op)
            return false
        if (this.isAssociative) { // Assiziative ops
            const array1 = this.associativeParts
            const array2 = other.associativeParts
            const isInArray1 = array1.every(item => array2.find(item2 => item.equals(item2)) !== undefined)
            const isInArray2 = array2.every(item => array1.find(item2 => item.equals(item2)) !== undefined)
            return array1.length === array2.length && isInArray1 && isInArray2
        } else
            return this.left.equals(other.left) && this.right.equals(other.right)
    }

    equalModuloSubstitution(other, subs) {
        if(!(other instanceof BinarySentence) || (other.op !== this.op))
            return false
        else {
            return this.left.equalModuloSubstitution(other.left, subs) && this.right.equalModuloSubstitution(other.left, subs)
        }
    }

    unify(other){
        if(!(other instanceof BinarySentence) || other.op !== this.op)
            return null
        else{
            const lUn = this.left.unify(other.left)
            if(lUn === null)
                return null
            const rUn = this.right.unify(other.right)
            if(rUn === null)
                return null
            return [...lUn, ...rUn]
        }
    }

    get freeVariables(){
        return new Set([...this.left.freeVariables, ...this.right.freeVariables])
    }

    get constants(){
        return new Set([...this.left.constants, ...this.right.constants])
    }

}

export class Falsum extends Sentence {
    get text() {
        return '\u22A5';
    }

    get latex() {
        return '\\bot';
    }

    equals(other) {
        return other instanceof Falsum
    }

    equalModuloSubstitution(other, subs) {
        return other instanceof Falsum
    }
    unify(other){
        if(!(other instanceof Falsum))
            return []
        else
            return null
    }

    get freeVariables(){
        return new Set()
    }

}

export class Atom extends Sentence {
    constructor(predicate, terms) {
        super()
        this.predicate = predicate;
        this.terms = terms
    }

    get text() {
        return `${this.predicate}(${this.terms.map((x) => x.text).join(", ")})`;
    }

    get latex() {
        return `${this.predicate}(${this.terms.map((x) => x.latex).join(", ")})`;
    }

    substitute(vari, cons) {
        return new Atom(this.predicate, this.terms.map((x) => x.substitute(vari, cons)));
    }

    equals(other){
        if(!(other instanceof Atom))
            return false

        if(this.terms.length !== other.terms.length)
            return false

        if (other.predicate !== this.predicate)
            return false

        return this.terms.every((x,i) => x.equals(other.terms[i]))
    }

    equalModuloSubstitution(other, subs) {
        if (!(other instanceof Atom) || this.predicate !== other.predicate || this.terms.length !== other.terms.length)
            return false
        for(let i=0; i< this.terms.length; i++){
            if(!this.terms[i].equalModuloSubstitution(other.terms[i], subs))
                return false
        }
        return true
    }
    unify(other){
        if(!(other instanceof Atom) || other.predicate !== this.predicate || other.terms.length !== this.terms.length)
            return null
        else{
            let subs = []
            for(let i=0; i<this.terms.length; i++){
                const subs2 = this.terms[i].unify(other.terms[i])
                if(subs2 === null)
                    return null
                subs = [...subs, ...subs2]
            }
            return subs
        }
    }

    get freeVariables(){
        let s = []
        for(const t of this.terms)
            s = [...s, ...t.freeVariables]
        return new Set(s)
    }

    get constants(){
        let s = []
        for(const t of this.terms)
            s = [...s, ...t.constants]
        return new Set(s)
    }
}

export class PropAtoms extends Sentence {
    constructor(name) {
        super()
        this.name = name;
    }

    get text() {
        return this.name
    }

    get latex() {
        return this.name
    }

    equals(other){
        return this.name === other.name
    }

    get freeVariables(){
        return new Set()
    }
}

export class Term {
    get text() {
        return this //throw "Not implemented"
    }

    equals(other){
        throw "Not implemented"
    }

    substitute(vari, cons) {
        throw "Not implemented"
    }

    equalModuloSubstitution(other, subs) {

        for(const [l,r] of subs){
            if(l.equals(this))
                return r.equals(other)
        }
        return false
    }

    unify(other){
        throw "Not implemented"
    }

    get freeVariables(){
        throw "Not implemented"
    }

}

export class FunctionTerm extends Term {
    constructor(fun, terms) {
        super()
        this.fun = fun;
        this.terms = terms;
    }

    get text() {
        return `${this.fun}(${this.terms.map((x) => x.text).join(", ")})`;
    }

    get latex() {
        return `${this.fun}(${this.terms.map((x) => x.latex).join(", ")})`;
    }

    substitute(vari, cons) {
        return new FunctionTerm(this.fun, this.terms.map((x) => x.substitute(vari, cons)));
    }

    equals(other){
        if(!(other instanceof FunctionTerm))
            return false

        if(this.terms.length !== other.terms.length)
            return false

        if (other.fun !== this.fun)
            return false

        return this.terms.every((x,i) => x.equals(other.terms[i]))
    }

    equalModuloSubstitution(other, subs) {
        if(super.equalModuloSubstitution(other, subs))
            return true

        if (!(other instanceof FunctionTerm) || this.fun !== other.fun || this.terms.length !== other.terms.length)
            return false
        for(let i=0; i< this.terms.length; i++){
            if(!this.terms[i].equalModuloSubstitution(other.terms[i], subs))
                return false
        }
        return true
    }

    unify(other){
        if(!(other instanceof Atom) || other.function !== this.function || other.terms.length !== this.terms.length)
            return null
        else{
            let subs = []
            for(let i=0; i<this.terms.length; i++){
                const subs2 = this.terms[i].unify(other.terms[i])
                if(subs2 === null)
                    return null
                subs = [...subs, ...subs2]
            }
            return subs
        }
    }

    get freeVariables(){
        let s = []
        for(const t of this.terms)
            s = [...s, ...t.freeVariables]
        return new Set(s)
    }

    get constants(){
        let s = []
        for(const t of this.terms)
            s = [...s, ...t.constants]
        return new Set(s)
    }
}

export class Constant extends Term {
    constructor(name) {
        super()
        this.name = name;
    }

    get text() {
        return this.name
    }

    get latex() {
        return this.name
    }

    substitute(vari, cons){
        if(this.text === vari.text){
            return cons;
        }
        return this;
    }

    equals(other){
        if(!(other instanceof Constant))
            return false

        return this.name === other.name
    }

    unify(other){
        if(!this.equals(other))
            return null
        else
            return []
    }
    get freeVariables(){
        return new Set()
    }

    equalModuloSubstitution(other, subs) {
        if(super.equalModuloSubstitution(other, subs))
            return true

        if(!(other instanceof Constant))
            return false

        return this.equals(other)
    }

    get constants(){
        return new Set([this.name])
    }
}

export class Variable extends Term {
    constructor(name) {
        super()
        this.name = name;
    }

    substitute(vari, cons) {
        if (this.equals(vari)) {
            return cons
        } else {
            return this
        }
    }

    equals(other){
        if(!(other instanceof Variable))
            return false
        return this.name === other.name
    }

    equalModuloSubstitution(other, subs) {
        if(super.equalModuloSubstitution(other, subs))
            return true

        if(!(other instanceof Variable))
            return false

        return this.equals(other) || (this in subs && subs[this].equals(other))
    }

    unify(other){
        if(!this.equals(other))
            if(other instanceof Constant) {
                return [[this.name, other.name]]
            } else
                return null
        else
            return []
    }

    get text(){
        return this.name
    }

    get freeVariables(){
        return new Set([this.name])
    }

    get constants(){
        return new Set()
    }

}

export function collateSubproofs(proofLines){
    let lineElements = []
    let buffer = []
    for (let i = 0; i < proofLines.length; i++) {
        const line = proofLines[i]

        /* Check whether the existing subproof has ended. This can happen in two cases:
            1) An assuption on the same level
            2) Any line on a higher level (i.e., lower level index)
            */
        if (buffer.length > 0 && ((line.isAssumption && buffer[0].level === line.level) ||  (buffer[0].level > line.level))){
            lineElements.push([[buffer[0]],collateSubproofs(buffer.slice(1))])
            buffer = [];
        }

        if (!line.isAssumption) {
            if (buffer.length > 0)
                buffer.push(proofLines[i])
            else
                lineElements.push(line)
        } else {
            buffer.push(proofLines[i])
        }
    }
    if(buffer.length > 0){
        lineElements.push([[buffer[0]],collateSubproofs(buffer.slice(1))])
    }
    return lineElements
}

export function generateLatexProof(premises, proofLines, preamble=true){

    const lines = []
    if(preamble)
        lines.push("\\begin{fitch}")
    for(const p of premises){
        try{
            lines.push(`\\fj ${p.sentence.latex} \\\\`)
        } catch(SyntaxError) {
            lines.push(`\\fj ${p.rawString} \\\\`)
        }

    }
    for(const p of proofLines){
        if(p instanceof Array)
            for(const sl of generateLatexProof(p[0], p[1], false))
                lines.push(`\\fa ${sl}`)
        else{
            let s = ""
            try{
                s = p.sentence.latex
            } catch(SyntaxError) {
                s = p.rawString
            }
            lines.push(`\\fa ${s} & ${p.justification.latex} \\\\`)
        }
    }
    if(preamble)
        lines.push("\\end{fitch}")
    return lines
}




export const UnaryOp = {
    NEG: "\u00AC",
};

const LatexUnaryOp = new Map([
    [UnaryOp.NEG, "\\neg"],
]);

function readUnaryOp(input) {
    switch (input) {
        case("\u00AC"):
            return UnaryOp.NEG
    }
}

export const BinaryOp = {
    AND: "\u2227",
    OR: "\u2228",
    IMPL: "\u2192",
    BIMPL: "\u2194"
};

export const LatexBinaryOp = new Map([
    [BinaryOp.AND, "\\wedge"],
    [BinaryOp.OR, "\\vee"],
    [BinaryOp.IMPL, "\\rightarrow"],
    [BinaryOp.BIMPL, "\\leftrightarrow"],
]);

function readBinaryOp(input) {
    switch (input) {
        case("\u2227"):
            return BinaryOp.AND
        case("\u2228"):
            return BinaryOp.OR
        case("\u2192"):
            return BinaryOp.IMPL
        case("\u2194"):
            return BinaryOp.BIMPL
        default:
            throw Error("Unknown input: " + input)
    }
}

export const Quantor = {
    EX: "\u2203",
    ALL: "\u2200",
};

const LatexQuantor = new Map([
    [Quantor.EX, "\\forall"],
    [Quantor.ALL, "\\exists"]
]);

function readQuantor(input) {
    switch (input) {
        case("\u2200"):
            return Quantor.ALL
        case("\u2203"):
            return Quantor.EX
        default:
            throw Error("Unknown input: " + input)
    }
}

