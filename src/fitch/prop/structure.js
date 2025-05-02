import { isIS } from '@mui/material/locale'
import {parse as peggyParse} from '../parser.js'

export function parse(input){
  return process(peggyParse(input))
}

function process(input){
  switch(input.type){
    case("quantSen"): return new QuantifiedSentence(readQuantor(input.quant), input.vari, process(input.sen))
    case("bin"): return new BinarySentence(process(input.left), readBinaryOp(input.op), process(input.right))
    case("un"): return new UnarySentence(readUnaryOp(input.op), process(input.sen))
    case("fun"): return new FunctionTerm(input.fun, input.terms.map((x) => process(x)))
    case("pred"): return new FunctionTerm(input.pred, input.terms.map((x) => process(x)))
    case("falsum"): return new Falsum()
    case("atom"): return input.const
    case("const"): return new Constant(input.const) //Todo: Distinquish between constants and variables
    default: throw Error("Unknown input: " + input)
  }
}

export class Sentence{
  constructor() { }
  equals(other) { throw "Not implemented" }
  substitute(vari, cons) {throw "Not implemented"}
  text() {return ""};
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

  get associativeParts(){
    if(!this.isAssociative)
      return [this]
    let res = [];
    for (const element of [this.left, this.right])  {
      if((element instanceof BinarySentence) && (element.op === this.op))
        res = [...res, ...element.associativeParts]
      else 
        res.push(element)
    }
    return res
  }

  get isAssociative(){
    return this.op == BinaryOp.AND || this.op == BinaryOp.OR
  }

  contains(other){
    const array1 = this.associativeParts
    if(other instanceof BinarySentence && this.op == other.op){
      const array2 = other.associativeParts
      return array2.length < array1.length && array2.every(item => array1.find(item2 => item===item2))
    } else {
      return array1.find(item => item == other)
    }
  }

  equals(other){
    if(!(other instanceof BinarySentence))
      return false
    if(this.op != other.op)
      return false
    if(this.isAssociative){ // Assiziative ops
      const array1 = this.associativeParts
      const array2 = other.associativeParts
      const isInArray1 = array1.every(item => array2.find(item2 => item===item2))
      const isInArray2 = array2.every(item => array1.find(item2 => item===item2))
      return array1.length === array2.length && isInArray1 && isInArray2
    } else
      return this.left.equals(other.left) && this.right.equals(other.right)
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
  NEG: "~",
};

function readUnaryOp(input){
  switch(input){
    case("~"): return UnaryOp.NEG
   }
}

export const BinaryOp = {
  AND: "&",
  OR: "|",
  IMPL: ">",
  BIMPL: "<>",
};

function readBinaryOp(input){
  switch(input){
    case("&"): return BinaryOp.AND
    case("|"): return BinaryOp.OR
    case(">"): return BinaryOp.IMPL
    case("<>"): return BinaryOp.BIMPL
    default: throw Error("Unknown input: " + input)
   }
}

export const Quantor = {
  EX: "?",
  ALL: "!",
};

function readQuantor(input){
  switch(input){
    case("!"): return Quantor.ALL
    case("?"): return Quantor.EX
    default: throw Error("Unknown input: " + input)
   }
}

