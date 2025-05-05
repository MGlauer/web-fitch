export class Rule {
    static derived = [];
    static label = "";

    static check(proof, lines, target, target_line) {

        try{
            this._check(proof, lines, target, target_line)
            for(const line of lines){
                if(!this.isAvailable(proof, line, target_line))
                    throw new RuleError(`Line ${line} is not available in line ${target_line}`)
            }
        } catch (error) {
            if(error instanceof RuleError){
                error.message =  `[ERROR applying ${this.label} to lines ${lines.join(',') }]: ${error.message}`
            }
            throw error
        }
    }

    static isAvailable(lines, referencedLineIndex, targetLineIndex){
        const referencedLine = getLine(lines, referencedLineIndex);
        const layer = referencedLine.level;
        for(let i=referencedLineIndex; i<lines.length; i++){
            const li = getLine(lines,i)
            if (li.level < layer || ((layer === li.level) && li.isAssumption)) {
                return false
            }
            if(i === targetLineIndex)
                return true
        }
        return false
    }

    static _check(proof, lines, target, target_line) {
        throw new Error("Not implemented")
    }
}

export class RuleError extends Error {

}


export function register(obj) {
    obj.id = Rule.derived.length;
    Rule.derived[obj.label] = obj;
}

export function assertAvailableIn(lines, i, j) {
    return;
}

export function getLine(lines, i) {
    return lines[i].sentence
}

export function getSubProof(lines, i, j) {
    return lines.slice(i, j).map((x) => x.sentence);
}