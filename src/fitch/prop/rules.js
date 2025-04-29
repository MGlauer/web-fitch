import {Falsum, UnarySentence, BinarySentence, BinaryOp, UnaryOp} from './structure.js'

export class Rule {
	static derived = [];
	static label = "";
	check(proof, lines, target, target_line) { throw "Not implemented" }
	check() { throw "Not implemented" }
}

function register(obj){
	obj.id = Rule.derived.length;
	Rule.derived.push(obj);
}

class Reiteration extends Rule {
	static { register(this); }
	static label = "Reit";
// Reit: Reiteration of line
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label +' to lines '+lines.join(',')+']: ';
		
		if(lines.length!=1) {
			throw flag+'Rule must be applied to one line.';
		}
		let bi = lines[0];
		let b = proof.getLine(bi)
		if(target.equals(b)) {
			throw flag+'The formula being derived must be the same as the formula on the rule line.';
		}
		proof.assertAvailableIn(target_line)
	}
}

// &I: Conjunction Introduction
class ConjunctionIntro extends Rule {

	static { register(this); }
	static label = "\u2227-Intro";

	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';
		if (lines.length != 2) {
			throw flag + 'Rule must be applied to two lines.';
		}

		let ai, bi = lines;
		
		let a = proof.getLine(ai);
		proof.assertAvailableIn(a, target_line);

		let b = proof.getLine(bi);
		proof.assertAvailableIn(b, target_line);

		if (!target.classList.contains(BinarySentence) || a.op != BinaryOp.AND) {
			throw flag + 'The formula being derived must be a conjunction.';
		}

		if (!target.equals(BinarySentence(a, BinaryOp.AND, b))) {
			throw flag + 'The formulas on lines ' + lines[0] + ' and ' + lines[1] + ' must be the conjuncts of the formula being derived.';
		}
	}
}

// &E: Conjunction Elimination
class ConjunctionElim extends Rule {
	static { register(this); }
	static label = "\u2227-Elim";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';
		if (lines.length != 1) {
			throw flag + 'Rule must be applied to one line.';
		}

		let ai = lines[0];
		let a = proof.getLine(ai);
		proof.assertAvailableIn(a, target_line);

		if (!a.classList.contains(BinarySentence) || a.op != BinaryOp.AND) {
			throw flag + 'The formula ' + a + ' must be a conjunction.';
		}

		if (!(a.contains(target))) {
			throw flag + 'The formula ' + target + ' must be a conjunct of ' + a;
		}
	}
}

function getSubproof(proof, subi, ci) {
	let sub = proof.getSubProof(subi)
	let c = proof.getDirectLine(ci - subi);
		
	if(!c) {
		throw 'The two rule lines must be in the same subproof.';
	}

	return sub, c

}


// >I: Conditional Introduction
class ConditionalIntro extends Rule {
	static { register(this); }
	static label = "\u2192-Intro";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';
	
		if (lines.length != 3 || lines[1] != "-") {
			throw flag + 'Rule must be applied to one subproof (citation of the form "j-k").';
		}

		var subi = lines[0], // line number of subproof
			ci = lines[2] - subi;

		let sub, c = getSubproof(proof, subi, ci)
		proof.assertAvailableIn(subi, target_line);
	
		let a = sub.premises[0]
	
		if (!target.classList.contains(BinarySentence) || target.op != BinaryOp.IMPL) {
			throw flag + 'The target formula being derived must be a conditional.';
		}

		if (target.left.equals(a)) {
			throw flag + 'The assumption on the first rule line must be the antecedent of the conditional being derived.';
		}
		if (target.right.equals(c)) {
			throw flag + 'The second rule line must be the consequent of the conditional being derived.';
		}
	}
}

// >E: Conditional Elimination
class ConditionalElim extends Rule {
	static { register(this); }
	static label = "\u2192-Elim";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';
	
		let ai, bi = lines;
	
		let a = proof.getLine(ai);
		proof.assertAvailableIn(a, target_line);

		let b = proof.getLine(bi);
		proof.assertAvailableIn(b, target_line);

	
		if (!a.classList.contains(BinarySentence) || a.op != BinaryOp.IMPL) {
			throw flag + 'The first rule line must be a conditional. (Remember: cite the line of the conditional first, the line of its antecedent second.)'
		}
		if (a.left.equals(b)) {
			throw flag + 'The second rule line must be the antecedent of the conditional on the first rule line. (Remember: cite the line of the conditional first, the line of its antecedent second.)';
		}
		if (!a.right.equals(target)) {
			throw flag + 'The formula being derived must be the consequent of the conditional on the first rule line.';
		}
	}
}

// vI: Disjunction Introduction
class DisjunctionIntro extends Rule {
	static { register(this); }
	static label = "\u2228-Intro";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to line ' + lines.join(',') + ']: '
	
		if (lines.length != 1) {
			throw flag + 'Rule must be applied to one line';
		}
	
		let ai = lines[0];
		let a = proof.getLine(ai);
		proof.assertAvailableIn(a, target_line);

		if (!target.classList.contains(BinarySentence) || target.op != BinaryOp.OR) {
			throw flag + 'The formula being derived must be a disjunction.';
		}

		if (!target.contains(a)) {
			throw flag + 'The formula on line ' + ai + ' must be a disjunct of the formula being derived.';
		}
	}
}

// vE: Disjunction Elimination
class DisjunctionElim extends Rule {
	static { register(this); }
	static label = "\u2228-Elim";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';
	
		if (lines.length != 7 || lines[2] != "-" || lines[5] != "-") {
			throw flag + 'Rule must be applied to a disjunction line and a pair of subproofs (with subproof citations of the form "j-k").';
		}
	
		var dli = lines[0], // disjunction line
			subi1 = lines[1], // first subproof assumption
			ci1 = lines[3], // first subproof conclusion
			subi2 = lines[4], // second subproof assumption
			ci2 = lines[6]; // second subproof conclusion

		let dl = proof.getLine(dli)
		proof.assertAvailableIn(dli, target_line)
	
		let [sub1, c1] = getSubproof(proof, subi1, ci1)
		let a1 = sub1.premises[0]
		proof.assertAvailableIn(subi1, target_line);
	
		let [sub2, c2] = getSubproof(proof, subi2, ci2);
		let a2 = sub2.premises[0]
		proof.assertAvailableIn(subi2, target_line);
	
		if (!dl.classList.contains(BinarySentence) || dl.op != BinaryOp.OR) {
			throw flag + 'The first rule line must be a disjunction.';
		}

		if (!(a1.equals(dl.left) && a2.equals(dl.right) || (a2.equals(dl.left) && a1.equals(dl.right)))) {
			throw flag + 'The first rule line must a disjunction of the assumptions of both subproofs.';
		}
	
		if (!(c1.equals(c2) && c1.equals(target))) {
			throw flag + 'The conclusions of both sub proofs must coincide with the target.';
		}
	}
}

// ~I: Negation Introduction
class NegationIntro extends Rule {
	static { register(this); }
	static label = String.fromCharCode(172)+"-Intro";
	check(proof, lines, target, target_line) {
		let flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';
	
		if (lines.length != 3 || lines[1] != "-") {
			throw flag + 'Rule must be applied to one subproof (citation of the form "j-k").';
		}
	
		let subi = lines[0] // line number of subproof assumption
		let ci = lines[2]; // line number of subproof conclusion
	
		let [sub, c] = getSubproof(proof, subi, ci)
		let a = sub.premises[0]
		proof.assertAvailableIn(subi, target_line);
	
		if (c.equals(Falsum())) {
			throw flag + 'The second rule line must be the absurdity.';
		}

		if (!target.classList.contains(UnarySentence) || target.op != UnaryOp.NOT || !target.right.equals(a)) {
			throw flag + 'The formula being derived must be the negation of the assumption on the first rule line.';
		}

	}
}


// #I: Falsum/Absurdity Introduction (formerly Negation Elimination)
class FalsumIntro extends Rule {
	static { register(this); }
	static label = "\u22A5-Intro";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';


	
		if (lines.length != 2) {
			throw flag + 'Rule must be applied to two lines.';
		}

		let ai = lines[0];
		let a = proof.getLine(ai);
		proof.assertAvailableIn(ai, target_line);

		let bi = lines[1];
		let b = proof.getLine(bi);
		proof.assertAvailableIn(bi, target_line);

		if (Falsum().equals(target)) {
			throw flag + 'The formula being derived must be the absurdity, #.';
		}
		if (!a.equals(UnarySentence(UnaryOp.NOT, b)) && !b.equals(UnarySentence(UnaryOp.NOT, a))) {
			throw flag + 'One of lines ' + lines[0] + ' or ' + lines[1] + ' must be the negation of the other.';
		}
	}
}

// ~E: Negation Elimination (formerly Double Negation Elimination)
class NegationElim extends Rule {
	static { register(this); }
	static label = String.fromCharCode(172)+"-Elim";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to line ' + lines.join(',') + ']: ';

		if (lines.length != 1) {
			throw flag + 'Rule must be applied to one line.';
		}

		let ai = lines[0];
		let a = proof.getLine(ai);
		proof.assertAvailableIn(ai, target_line);

		if (!a.equals(UnarySentence(UnaryOp.NOT, UnarySentence(UnaryOp.NOT, target)))) {
			throw flag + 'Formula on line ' + lines[0] + ' must be the double negation of the formula being derived.';
		}
	}
}

// EFQ: Ex Falso Quodlibet
class FalsumElim extends Rule {
	static { register(this); }
	static label = "\u22A5-Elim";

	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying ' + this.label + ' to line ' + lines.join(',') + ']: ';

		if (lines.length != 1) {
			throw flag + 'Rule must be applied to one line.';
		}

		let ai = lines[0];
		let a = proof.getLine(ai);
		proof.assertAvailableIn(ai, target_line);

		if (a.equals(Falsum())) {
			throw flag + 'Formula on line ' + lines[0] + ' must be the absurdity.';
		}
	}
}

// <>I: Biconditional Introduction
class BiconditionalIntro extends Rule {
	static { register(this); }
	static label = "\u2194-Intro";
	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: ';
	
		if (lines.length != 6 || lines[1] != "-" || lines[4] != "-") {
			throw flag + 'Rule must be applied to two subproofs (citations of the form "j-k").';
		}
	
		if (l.tr.length != 3 || l.tr[1] != '<>') {
			throw flag + 'The formula being derived must be a biconditional.';
		}
	
		var subi1 = lines[1], // first subproof assumption
			ci1 = lines[3], // first subproof conclusion
			subi2 = lines[4], // second subproof assumption
			ci2 = lines[6]; // second subproof conclusion
	
		let sub1, c1 = getSubproof(proof, subi1, ci1)
		let a1 = sub1.premises[0]
		proof.assertAvailableIn(subi1, target_line);
	
		let sub2, c2 = getSubproof(proof, subi2, ci2);
		let a2 = sub2.premises[0]
		proof.assertAvailableIn(subi2, target_line);
	
		if (!target.classList.contains(BinarySentence) || target.op != BinaryOp.BIMPL) {
			throw flag + 'The formula being derived must be a biconditional.';
		}

		if (!(a2.equals(c1) && a1.equals(c2))) {
			throw flag + 'The formula on the first rule line must match the one on the fourth, and the one on the second must match the one on the third.';
		}
		if (target.equals(BinarySentence(a1, BinaryOp.BIMPL, a2))) {
			throw flag + 'The biconditional being derived must be composed of the formulas on the rule lines.';
		}
	}
}

//<>E: Biconditional Elimination
class BiconditionalElim extends Rule {
	static { register(this); }
	static label = "\u2194-Elim";

	check(proof, lines, target, target_line) {
		var flag = '[ERROR applying '+ this.label + ' to lines ' + lines.join(',') + ']: '
	
		if (lines.length != 2) {
			throw flag + 'Rule must be applied to two lines.';
		}

		let ai = lines[0];
		let a = proof.getLine(ai);
		proof.assertAvailableIn(ai, target_line);

		let bi = lines[1];
		let b = proof.getLine(bi);
		proof.assertAvailableIn(bi, target_line);

		if (!a.classList.contains(BinarySentence) || a.op != BinaryOp.BIMPL) {
			throw flag + 'The formula on the first rule line must be a biconditional.';
		}
		if (!((a.left.equals(b) && a.right.equals(target)) || (a.left.equals(target) && a.right.equals(b)))) {
			throw flag + 'The formula being derived must be one side of the biconditional on the first rule line, and the formula on the second rule line the other side of it.';
		}
	}
}

