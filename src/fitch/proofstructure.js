export class Proof{
    constructor(premises, lines) {
        this.premises = premises
        this.lines = lines
    }

    getLine(i) {
        let res = undefined
        for (let j = 0; j < this.premises.length; j++){
            if (i == 0) { return this.premises[j] }
            i--;
        }
        for (let j = 0; j < this.lines.length; j++){
            let l = this.lines[j]
            if (l.classList.contains(Proof)) {
                let gl = l.getLine(i);
                let res = gl[0], i = gl[1];
                if (res) {
                    return res, i
                }
            } else {
                if (i == 0) { return l}
                i--;
            }
        }
        return res, i
    }

    getDirectLine(i) {
        let res = undefined
        for (let j = 0; j < this.premises.length; j++){
            if (i == 0) { return this.premises[j] }
            i--;
        }
        for (let j = 0; j < this.lines.length; j++){
            let l = this.lines[j]
            if (l.classList.contains(Proof)) {
                i -= l.premises.length - l.lines.length
                if (i < 0) { return undefined; }

            } else {
                if (i == 0) { return l }
                i--;
            }
        }
        return res;
    }

    getSubProof(i) {
        let res = undefined
        for (let j = 0; j < this.premises.length; j++){
            if (i == 0) { return this.premises[j] }
            i--;
        }
        for (let j = 0; j < this.lines.length; j++){
            let l = this.lines[j]
            if (l.classList.contains(Proof)) {
                if (i == 0) { return l };
                let gl = l.getSubProof(i);
                let res = gl[0], i = gl[1];
                if (res) {
                    return res, i
                }
            } else {
                if (i == 0) {
                    throw "Line " + l + "is not a subproof."
                }
                i--;
            }
        }
        return res, i
    }

    getAvailableLines(i){
        let lines = [];
        return res, i
    }

    assertAvailableIn(i, j){

    }
}

export class SentenceLine{
    constructor(sentence, justification){
        this.sentence = sentence;
        this.justification = justification
    }

    check(lines){

    }
}

export class Justification{
    constructor(lines, rule) {
        this.rule = rule;
        this.lines = lines;
    }
}