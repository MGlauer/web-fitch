import ProofLineBox from "./ProofLineBox.jsx";
import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {Justification, SentenceLine} from "../fitch/proofstructure.js";
import {Sentence} from "../fitch/prop/structure.js";
import {Rule} from "../fitch/rules.js";
import Divider from '@mui/material/Divider';

export default function ProofBox({
                                     premises,
                                     proofLines,
                                     addLine,
                                     removeLineWrapper,
                                     updateLine,
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
            addLine(new SentenceLine(new Sentence(), new Justification(Rule.derived["Reit"], {})), premises.length > 0 ? premises[premises.length - 1][0] + 1 : 0);
        }}
        >Add Premise</Button>)
    }

    for (let i = 0; i < proofLines.length; i++) {
        const [lineNum, line] = proofLines[i]
        if (!line.isAssumption) {
            if (buffer.length > 0)
                buffer.push(proofLines[i])
            else
                lineElements.push((
                    <ProofLineBox lineNum={lineNum + 1} line={line} removeLine={removeLineWrapper(lineNum)}
                                  updateFun={updateLine(lineNum)}/>))
        } else
            buffer.push(proofLines[i])
        // Check next line to see whether to finish a subproof
        if (buffer.length > 0 && ((i + 1 === proofLines.length) || (line.isAssumption && line.layer <= line.layer))) {
            lineElements.push((<ProofBox premises={[buffer[0]]} proofLines={buffer.slice(1)} addLine={addLine}
                                         removeLineWrapper={removeLineWrapper} updateLine={updateLine}/>));
            buffer = [];
        }
    }

    let lastLineNumber = 0;
    let lastLineLayer = 0;
    if (proofLines.length > 0) {
        lastLineNumber = proofLines[proofLines.length - 1][0]
        lastLineLayer = proofLines[proofLines.length - 1][1].layer
    } else {
        if (premises.length > 0) {
            lastLineNumber = premises[premises.length - 1][0]
            lastLineLayer = premises[premises.length - 1][1].layer
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
                addLine(new SentenceLine(new Sentence(), new Justification(Rule.derived["Reit"], {}), lastLineLayer, false), lastLineNumber + 1);
            }}
            > Add Line
            </Button>
            <Button sx={{fontSize: 10}} onClick={() => {
                addLine(new SentenceLine(new Sentence(), new Justification(Rule.derived["Assumption"], {}), lastLineLayer + 1, true), lastLineNumber + 1);
            }}
            > Start Subproof </Button>
        </Stack>
    )

}