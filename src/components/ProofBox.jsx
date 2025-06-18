import ProofLineBox from "./ProofLineBox.jsx";
import * as React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
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
    const isTopLevel = premisesEnd !== null

    for (const [i, premise] of premises) {
        premiseBlock.push((
            <ProofLineBox lineNum={i + 1}
                          line={premise}
                          updateFun={updateLine(i)}
                          removeLine={removeLineWrapper(i)}
                          //addLineBefore={() => addLineAt(i)}
                          //addLineAfter={() => addLineAt(i+1)}
                          //startSubproofAfter={() => startSubproofLineAt(i+1)}
            />))
    }
    if (isTopLevel) {
        premiseBlock.push(
            <Box sx={{
                display: 'flex',
                justifyContent: "flex-start",
                alignItems: "flex-start"
            }}><Button sx={{fontSize: 10}} onClick={() => {
            setPremisesEnd(premisesEnd + 1)
            addLine(new SentenceLine("", new Justification(Rule.derived["Reit"], {}), layer, true), premises.length > 0 ? premises[premises.length - 1][0] + 1 : 0);
        }}
            >Add Premise</Button></Box>)
    }

    function addLineAt(i){
        return addLine(new SentenceLine("", new Justification(Rule.derived["Reit"], {}), layer, false), i)
    }

    function startSubproofLineAt(i){
        return addLine(new SentenceLine("", new Justification(Rule.derived["Assumption"], {}), layer + 1, true), i)
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
                    <ProofLineBox lineNum={lineNum + 1}
                                  line={line}
                                  removeLine={removeLineWrapper(lineNum)}
                                  addLineBefore={() => addLineAt(lineNum)}
                                  addLineAfter={() => addLineAt(lineNum+1)}
                                  startSubproofBefore={() => startSubproofLineAt(lineNum)}
                                  startSubproofAfter={() => startSubproofLineAt(lineNum+1)}
                                  updateFun={updateLine(lineNum)}
                    />))
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
        <Box sx={{pt:2, pl:3, display: 'block'}}>
            <Stack direction="column" sx={{
                borderColor: "primary.dark",
                borderLeft: 1,
                display: "block"
            }}>
                {premiseBlock}
                <Divider sx={{bgcolor: "primary.dark"}} flexItem/>
                {lineElements}
                <Box sx={{
                    display: 'flex',
                    justifyContent: "flex-start",
                    alignItems: "flex-start"
                }}>
                    <Button sx={{fontSize: 10}} onClick={() => {
                        addLine(new SentenceLine("", new Justification(Rule.derived["Reit"], {}), layer, false), lastLineNumber + 1);
                    }}
                    > Add Line
                    </Button>
                    <Button sx={{fontSize: 10}} onClick={() => {
                        addLine(new SentenceLine("", new Justification(Rule.derived["Assumption"], {}), layer + 1, true), lastLineNumber + 1);
                    }}
                    > Start Subproof </Button>
                </Box>
            </Stack>
        </Box>
    )

}