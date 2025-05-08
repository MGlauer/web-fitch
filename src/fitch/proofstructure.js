import {parse} from "../fitch/structure.js";

export class SentenceLine {
    constructor(rawString, justification, level, isAssumption = false, parseError=null, ruleError=null) {
        this.rawString = rawString;
        this.justification = justification
        this.level = level
        this.isAssumption = isAssumption
        this.parseError = parseError
        this.ruleError = ruleError
    }

    get sentence(){
        return parse(this.rawString)
    }

    check(lines, targetLine, premiseEnd) {
        return this.justification.rule.check(lines, this.justification.lines.processed, this.sentence, targetLine, premiseEnd)
    }
}

export class Justification {
    constructor(rule, lines) {
        this.rule = rule;
        this.lines = lines;
    }
}