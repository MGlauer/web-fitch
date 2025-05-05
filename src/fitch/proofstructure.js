export class SentenceLine {
    constructor(sentence, justification, level = 0, isAssumption = false) {
        this.sentence = sentence;
        this.justification = justification
        this.level = level
        this.isAssumption = isAssumption
    }

    check(lines, targetLine) {
        return this.justification.rule.check(lines, this.justification.lines.processed, this.sentence, targetLine)
    }
}

export class Justification {
    constructor(rule, lines) {
        this.rule = rule;
        this.lines = lines;
    }
}