{
    input = input.replaceAll(" ", "");
	function flatten(sen, more){
    	let op = undefined;
        if(more.length == 0) return sen;
        let res = [sen];
        for(let i=0; i<more.length; i+=1){
       		if(!op){op = more[i][0];};
        	if(op != more[i][0]){
            	throw new peg$SyntaxError("Different operators on same level");
            }
            res.push(more[i][1])
        }
        let r = res[res.length-1]
        for(let i=res.length-2; i>=0; i--){
        	r = {type:"bin", left:res[i], op:op, right:r}
        }
        return r
    }
}

start
  = Sen / ""

Sen
  = left:QSen more:((binop QSen)*) { return flatten(left, more); }

QSen
 = q:quant v:functionConVarSym s:QSen { return {type:"quantSen", quant:q, vari:v, sen:s}; }
 / PSen

PSen
 = n:neg s:QSen {return {type: "un", op:n, sen:s};}
 / "(" left:Sen ")" {return left;}
 / a:Atom

Atom
  = pred:predicateSym par:("(" (Term|1..,","|)  ")")?  {if(!par){return {type:"atom", const:pred};}else{return {type: "pred", pred:pred, terms:par[1]}}; }
  / '#' {return {type:"falsum"}}
  / '\u22A5' {return {type:"falsum"}}
   / l:Term "=" r:Term {return {type: "pred", pred:"=", terms:[l,r]}}

Term
	= fun:functionConVarSym par:("(" (Term|1..,","|)  ")")?  {if(!par){return {type:"const", const:fun};}else{return {type: "fun", fun:fun, terms:par[1]};}}
  
predicateSym
  = $([A-Z][A-z]*)

functionConVarSym
  = $([a-z]+)

binop
  = '&' {return "\u2227"}
  / '|' {return "\u2228"}
  / '>' {return "\u2192"}
  / '<>' {return "\u2194"}
  / '\u2227'
  / '\u2228'
  / '\u2192'
  / '\u2194'

neg
 = '~' {return "\u00AC";} / '\u00AC'

quant
  = '!' {return "\u2200"} / '?' {return "\u2203"} / '\u2203' / '\u2200'
