import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ProofBox from "./ProofBox.jsx"
import {Justification, SentenceLine} from "../fitch/proofstructure.js";
import {RuleError} from "../fitch/rules.js"

export default function FitchBox() {
    const [premisesEnd, setPremisesEnd] = React.useState(0);
    const [lines, setLines] = React.useState([]);

    const premises = lines.entries().toArray().slice(0, premisesEnd);
    const proofLines = lines.entries().toArray().slice(premisesEnd);

    function addLine(line, insertIndex) {
        setLines([...lines.slice(0, insertIndex), line, ...lines.slice(insertIndex)])
    }

    function removeLineWrapper(removeIndex) {
        return () => {

            const layer = lines[removeIndex].level;
            let removeEnd = removeIndex;
            if(removeIndex >= premisesEnd){
                if (lines[removeIndex].isAssumption) {
                    removeEnd++;
                    for (; removeEnd < lines.length; removeEnd++) {
                        if (lines[removeEnd].level < layer || ((layer === lines[removeEnd].level) && lines[removeEnd].isAssumption)) {
                            removeEnd--;
                            break;
                        }
                    }
                }
            } else {
                setPremisesEnd(premisesEnd-1)
            }

            // Adapt references in following lines
            const removedLines = removeEnd - removeEnd + 1
            const followingLines = []
            for(let i=removeEnd+1; i<lines.length; i++){
                const l = lines[i]
                if(l.justification.lines.processed) {
                    let textParts = []
                    let refs = []
                    for (let j = 0; j < l.justification.lines.processed.length; j++) {
                        let ref = l.justification.lines.processed[j]
                        if (ref instanceof Array) {
                            ref = [ref[0] - removedLines, ref[1] - removedLines]
                            textParts.push(`${ref[0]+1}-${ref[1]+1}`)
                        } else {
                            ref = ref - removedLines
                            textParts.push(ref+1)
                        }
                        refs.push(ref)
                    }
                    const j = new Justification(l.justification.rule, {processed: refs, text:textParts.join(",")})
                    followingLines.push(new SentenceLine(l.rawString, j, l.level, l.isAssumption))
                } else
                    followingLines.push(l)
            }
            setLines([...lines.slice(0, removeIndex), ...followingLines])
        }
    }

    function updateLine(i) {
        return ((newLine) => {
            let newLines = [...lines]
            newLines[i] = newLine
            setLines(newLines)
        });
    }

    function checkProof(){
        for (let i = premisesEnd; i < lines.length; i++) {
            let newLine = lines[i]
            try {
                newLine.ruleError = ""
                newLine.parseError = ""
                if(!newLine.isAssumption)
                    newLine.check(lines, i, premisesEnd)
                newLine.isValid = true;

            } catch (error) {
                if(error instanceof  RuleError)
                    newLine.ruleError = error.message
                else if(error instanceof SyntaxError)
                {
                    newLine.parseError = error.message
                } else
                    throw error
            }
        }
        setLines([...lines])
    }

    return (
        <Box>
            <Box sx={{overflow: "auto"}}>
                <ProofBox premises={premises} proofLines={proofLines} addLine={addLine}
                          removeLineWrapper={removeLineWrapper} updateLine={updateLine} setPremisesEnd={setPremisesEnd}
                          premisesEnd={premisesEnd}></ProofBox>
            </Box>
            <Button onClick={checkProof}>
                Check Proof
            </Button>
        </Box>
    );
}