{
    input = input.replaceAll(" ", "");
	function flatten(sen, more){
    	let op = undefined;
        if(more.length == 0) return sen;
        let res = [sen];
        for(let i=0; i<more.length; i+=1){
       		if(!op){op = more[i][0];};
        	if(op != more[i][0]){
            	throw "Different operators on same level";
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
  = Sen

Sen
  = q:quant v:functionConVarSym s:PSen { return {type:"quantSen", quant:q, vari:v, sen:s}; }
  / left:PSen more:((binop PSen)*) { return flatten(left, more); }

PSen
 = n:neg s:PSen {return {type: "un", data: {op:n, sen:s}};}
 / "(" left:Sen ")" {return left;}
 / a:Atom
 
Atom
  = pred:predicateSym par:("(" (Term|1..,","|)  ")")?  {if(!par){return {type:"atom", const:pred};}else{return {type: "pred", data:{pred:pred, terms:par[1]}}}; }
  / '#' {return {type:"falsum"}}
  / '\u22A5' {return {type:"falsum"}}

Term
	= fun:functionConVarSym par:("(" (Term|1..,","|)  ")")?  {if(!par){return {type:"const", const:fun};}else{return {type: "fun", data:{fun:fun, terms:par[1]}};}}

predicateSym
  = $([A-uw-z][A-uw-z]*)
  
functionConVarSym
  = $([a-z]+)

binop
  = '&' / '|' / '>' / '<>' / '\u2227' {return "&"} / '\u2228' {return "|"} / '\u2192' {return ">"} / '\u2194' {return "<>"}

neg
 = '~' / '\u00AC' {return "~";}

quant
  = '!' {return "!"} / '?' {return "?"} / '\u2203' {return "?"} / '\u2200' {return "!"}