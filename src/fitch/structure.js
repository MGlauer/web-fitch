import {parse as peggyParse} from './parser.js'

export function parse(input) {
    return process(peggyParse(input))
}

function process(input) {
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
            return new FunctionTerm(input.pred, input.terms.map((x) => process(x)))
        case("falsum"):
            return new Falsum()
        case("atom"):
            return new PropAtoms(input.const)
        case("const"):
            return new Constant(input.const) //Todo: Distinquish between constants and variables
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
        throw "Not implemented"
    }

    substitute(vari, cons) {
        throw "Not implemented"
    }
}

export class UnarySentence extends Sentence {
    constructor(op, right) {
        super()
        this.op = op;
        this.right = right;
    }

    get text() {
        return this.op + this.right.text
    };

    substitute(vari, cons) {
        return UnarySentence(this.op, this.right.substitute(vari, cons))
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
        return `${this.quant.text}${this.variable.text}(${this.right.text})`
    };

    substitute(vari, cons) {
        if (this.variable == vari) {
            return this
        } else {
            return QuantifiedSentence(this.quant, this.variable, this.right.substitute(vari, cons))
        }
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
        return this.op == BinaryOp.AND || this.op == BinaryOp.OR
    }

    get text() {
        if(this.isAssociative)
            return this.associativeParts.map((x) => x.text).join(this.op)
        else
            return `${this.left.text}${this.op}${this.right.text}`
    }

    substitute(vari, cons) {
        return BinarySentence(this.left.substitute(vari, cons), this.op, this.right.substitute(vari, cons))
    }

    contains(other) {
        const array1 = this.associativeParts
        if (other instanceof BinarySentence && this.op == other.op) {
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
            const isInArray1 = array1.every(item => array2.find(item2 => item === item2))
            const isInArray2 = array2.every(item => array1.find(item2 => item === item2))
            return array1.length === array2.length && isInArray1 && isInArray2
        } else
            return this.left.equals(other.left) && this.right.equals(other.right)
    }

}

export class Falsum extends Sentence {
    get text() {
        return '\u22A5';
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

    substitute(vari, cons) {
        return Atom(this.predicate, this.terms.map((x) => x.substitute(vari, cons)));
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

    equals(other){
        return this.name === other.name
    }
}

export class Term extends Atom {

}

export class FunctionTerm extends Term {
    constructor(fun, terms) {
        super()
        this.fun = fun;
        this.terms = terms
    }

    get text() {
        return `${this.fun}(${this.terms.map((x) => x.text).join(", ")})`;
    }

    substitute(vari, cons) {
        return Atom(this.fun, this.terms.map((x) => x.substitute(vari, cons)));
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
}

export class Variable extends Term {
    constructor(name) {
        super()
        this.name = name;
    }

    substitute(vari, cons) {
        if (this == vari) {
            return cons
        } else {
            return this
        }
    }
}


export const UnaryOp = {
    NEG: "\u00AC",
};

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
    BIMPL: "\u2194",
};

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

