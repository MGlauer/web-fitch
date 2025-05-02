export class Rule {
	static derived = [];
	static label = "";
	check(proof, lines, target, target_line) { throw "Not implemented" }
}

export function register(obj){
	obj.id = Rule.derived.length;
	Rule.derived[obj.label]=obj;
}

export function assertAvailableIn(lines, i, j){
    return;
}

export function getLine(lines, i){
    return lines[i-1].sentence
}

export function getSubProof(lines, i, j){
    return lines.slice(i-1, j-1).map((x) => x.sentence);
}