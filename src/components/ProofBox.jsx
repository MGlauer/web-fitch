import ProofLineBox from "./ProofLineBox.jsx";
import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {Justification, SentenceLine} from "../fitch/proofstructure.js";
import {Sentence} from "../fitch/structure.js";
import {Rule} from "../fitch/rules.js";
import Divider from '@mui/material/Divider';




export default function ProofBox({
                                     premises,
                                     proofLines,
                                     addLine,
                                     removeLineWrapper,
                                     updateLine,
                                     layer=0,
                                     setPremisesEnd = null,
                                     premisesEnd = null
                                 }) {
    let lineElements = []
    let buffer = [];

    let premiseBlock = []


    for (const [i, premise] of premises) {
        premiseBlock.push((
            <ProofLineBox lineNum={i + 1} line={premise} removeLine={removeLineWrapper(i)} updateFun={updateLine(i)}/>))
    }
    if (premisesEnd !== null) {
        premiseBlock.push(<Button sx={{fontSize: 10}} onClick={() => {
            setPremisesEnd(premisesEnd + 1)
            addLine(new SentenceLine(new Sentence(), new Justification(Rule.derived["Reit"], {}), layer, true), premises.length > 0 ? premises[premises.length - 1][0] + 1 : 0);
        }}
        >Add Premise</Button>)
    }

    // Collate subproofs
    for (let i = 0; i < proofLines.length; i++) {
        const [lineNum, line] = proofLines[i]

        /* Check whether the existing subproof has ended. This can happen in two cases:
            1) An assuption on the same level
            2) Any line on a higher level (i.e., lower level index)
            */
        if (buffer.length > 0 && ((line.isAssumption && buffer[0][1].level === line.level) ||  (buffer[0][1].level > line.level))){
            lineElements.push((<ProofBox premises={[buffer[0]]} proofLines={buffer.slice(1)} addLine={addLine}
                                         removeLineWrapper={removeLineWrapper} updateLine={updateLine} layer={layer+1}/>));
            buffer = [];
        }

        if (!line.isAssumption) {
            if (buffer.length > 0)
                buffer.push(proofLines[i])
            else
                lineElements.push((
                    <ProofLineBox lineNum={lineNum + 1} line={line} removeLine={removeLineWrapper(lineNum)}
                                  updateFun={updateLine(lineNum)}/>))
        } else {
            buffer.push(proofLines[i])
        }
    }
    if (buffer.length > 0) {
        lineElements.push((<ProofBox premises={[buffer[0]]} proofLines={buffer.slice(1)} addLine={addLine}
                                     removeLineWrapper={removeLineWrapper} updateLine={updateLine} layer={layer+1}/>));
    }

    let lastLineNumber = 0;
    if (proofLines.length > 0) {
        lastLineNumber = proofLines[proofLines.length - 1][0]
    } else {
        if (premises.length > 0) {
            lastLineNumber = premises[premises.length - 1][0]
        }
    }

    return (
        <Stack direction="column" sx={{
            borderColor: "primary.dark", mt: 1, ml: 5, borderLeft: 1, display: 'flex', justifyContent: "flex-start",
            alignItems: "flex-start",
        }}>
            {premiseBlock}
            <Divider sx={{bgcolor: "primary.dark"}} flexItem/>
            {lineElements}
            <Button sx={{fontSize: 10}} onClick={() => {
                addLine(new SentenceLine(new Sentence(), new Justification(Rule.derived["Reit"], {}), layer, false), lastLineNumber + 1);
            }}
            > Add Line
            </Button>
            <Button sx={{fontSize: 10}} onClick={() => {
                addLine(new SentenceLine(new Sentence(), new Justification(Rule.derived["Assumption"], {}), layer + 1, true), lastLineNumber + 1);
            }}
            > Start Subproof </Button>
        </Stack>
    )

}