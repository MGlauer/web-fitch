export class Sentence{
  constructor() { }
  equals(other) { throw "Not implemented" }
  substitute(vari, cons) {throw "Not implemented"}
  render() {return ""};
}

export class UnarySentence extends Sentence{
  constructor(op, right) {
    super()
    this.op = op;
    this.right = right;
  }

  substitute(vari, cons) {
    return UnarySentence(this.op, this.right.substitute(vari, cons))
  }

}

export class QuantifiedSentence extends Sentence{
  constructor(quant, vari, right) {
    super()
    this.quant = quant;
    this.variable = variable
    this.right = right;
  }

  substitute(vari, cons) {
    if (this.variable == vari) {
      return this
    } else {
      return QuantifiedSentence(this.quant, this.variable, this.right.substitute(vari, cons))
    }
  }

}

export class BinarySentence extends Sentence{
  constructor(left, op, right) {
    super()
    this.left = left;
    this.op = op;
    this.right = right;
  }

  substitute(vari, cons) {
    return BinarySentence(this.left.substitute(vari, cons), this.op, this.right.substitute(vari, cons))
  }

}

export class Falsum extends Sentence{}

export class Atom extends Sentence{
  constructor(predicate, terms) {
    super()
    this.predicate = predicate;
    this.terms = terms
  }

  substitute(vari, cons) {
    return Atom(this.predicate, this.terms.map((x) => x.substitute(vari, cons)));
  }

}

export class Term extends Atom { }

export class FunctionTerm extends Term{
  constructor(fun, terms) {
    super()
    this.fun = fun;
    this.terms = terms
  }

  substitute(vari, cons) {
    return Atom(this.fun, this.terms.map((x) => x.substitute(vari, cons)));
  }

}

export class Constant extends Term{
  constructor(name) {
    super()
    this.name = name;
  }
}

export class Variable extends Term{
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
  NEG: Symbol(),
};

export const BinaryOp = {
  AND: Symbol(),
  OR: Symbol(),
  IMPL: Symbol(),
  BIMPL: Symbol(),
};

export const Quantor = {
  EX: Symbol(),
  ALL: Symbol(),
};

