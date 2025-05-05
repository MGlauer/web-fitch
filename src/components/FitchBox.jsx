import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ProofBox from "./ProofBox.jsx"
import {SentenceLine} from "../fitch/proofstructure.js";
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
            if (lines[removeIndex].isAssumption) {
                removeEnd++;
                for (; removeEnd < lines.length; removeEnd++) {
                    if (lines[removeEnd].level < layer || ((layer === lines[removeEnd].level) && lines[removeEnd].isAssumption)) {
                        removeEnd--;
                        break;
                    }
                }
            }

            setLines([...lines.slice(0, removeIndex), ...lines.slice(removeEnd + 1)])
        }
    }

    function updateLine(i) {
        return ((newLine) => {
            let newLines = [...lines]
            newLines[i] = newLine
            setLines(newLines)
        });
    }
    console.log(lines)
    return (
        <Box>
            <ProofBox premises={premises} proofLines={proofLines} addLine={addLine}
                      removeLineWrapper={removeLineWrapper} updateLine={updateLine} setPremisesEnd={setPremisesEnd}
                      premisesEnd={premisesEnd}></ProofBox>
            <Button onClick={() => {
                for (let i = premisesEnd; i < lines.length; i++) {
                    let newLine = lines[i]
                    try {
                        newLine.check(lines, i)
                        newLine.isValid = true;

                    } catch (error) {
                        if(error instanceof  RuleError)
                            newLine.error = error.message
                        else
                            throw error
                    }
                }
                setLines([...lines])
            }}>
                Check Proof
            </Button>
        </Box>
    );
}