import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ProofBox from "./ProofBox.jsx"
import {Justification, SentenceLine} from "../fitch/proofstructure.js";
import {RuleError} from "../fitch/rules.js"

export default function FitchBox({premisesEnd, setPremisesEnd, lines, setLines}) {
    const entries = [...lines.entries()]
    const premises = entries.slice(0, premisesEnd);
    const proofLines = entries.slice(premisesEnd);

    function alterRefs(justification, alter){
        if(justification.lines.processed) {
            let textParts = []
            let refs = []
            for (let j = 0; j < justification.lines.processed.length; j++) {
                let ref = justification.lines.processed[j]
                if (ref instanceof Array) {
                    ref = [alter(ref[0]), alter(ref[1])]
                    textParts.push(`${ref[0]+1}-${ref[1]+1}`)
                } else {
                    ref = alter(ref)
                    textParts.push(ref+1)
                }
                refs.push(ref)
            }
            return new Justification(justification.rule, {processed: refs, text:textParts.join(",")})
        } else
            return justification
    }


    function addLine(line, insertIndex) {

        let followingLines = []
        for(let i=insertIndex; i<lines.length; i++){
            followingLines.push(new SentenceLine(lines[i].rawString, alterRefs(lines[i].justification, (j) => j>=insertIndex?j+1:j), lines[i].level, lines[i].isAssumption, null, null, lines[i].newConstant))
        }
        setLines([...lines.slice(0, insertIndex), line, ...followingLines])
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
            const removedLines = removeEnd - removeIndex + 1
            const followingLines = []
            for(let i=removeEnd+1; i<lines.length; i++){
                followingLines.push(new SentenceLine(lines[i].rawString, alterRefs(lines[i].justification, (j) => j>=removeEnd?j-removedLines:j), lines[i].level, lines[i].isAssumption, null, null, lines[i].newConstant))
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