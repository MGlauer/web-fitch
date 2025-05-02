import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ProofLineBox from "./ProofLineBox.jsx"
import {Justification, SentenceLine} from "../fitch/proofstructure.js";
import {Sentence} from "../fitch/prop/structure.js";
import {Rule} from "../fitch/rules.js";


import * as Rules from "../fitch/prop/rules.js"

export default function FitchBox() {
    const [premisesEnd, setPremisesEnd] = React.useState(0);
    const [lines, setLines] = React.useState([]);

    function updateLine(i){
        return ((newLine) => {
            let newLines = [...lines]
            newLines[i] = newLine,
                setLines(newLines)
        });
    }

    return (
        <Box>
            <Stack>
                {lines.entries().toArray().slice(0,premisesEnd).map(([i,x]) => (<ProofLineBox lineNum={i+1} line={x} requiresJustification={false} updateFun={updateLine(i)} />))}
            </Stack>
            <Button onClick={() => {
                setPremisesEnd(premisesEnd+1)
                setLines([...lines.slice(0,premisesEnd), new SentenceLine(new Sentence(), new Justification(Rule.derived["Reit"], {})), ...lines.slice(premisesEnd)]);
            }}
            >Add Premise</Button>
            <hr />
            <Stack>
                {lines.entries().toArray().slice(premisesEnd).map(([i,x]) => (<ProofLineBox lineNum={i+1} line={x} requiresJustification={true} updateFun={updateLine(i)} />))}
            </Stack>
            <Button onClick={() => {
                setLines([...lines, new SentenceLine(new Sentence(), new Justification(Rule.derived["Reit"],  {}), 0, false)]);
            }}
            > Add Line</Button>
            <Button onClick={() => {
                setLines([...lines, new SentenceLine(new Sentence(), new Justification(Rule.derived["Reit"],  {}), 0, true)]);
            }}
            > Start Subproof </Button>
            <Button onClick={() => {
                for(let i = premisesEnd; i<lines.length; i++){
                    let newLine = new SentenceLine(lines[i].sentence, lines[i].justification);
                    try{
                        newLine.check(lines, i)
                        newLine.isValid = true;

                    } catch (error) {
                        newLine.error = error
                    }
                    console.log(newLine)
                    updateLine(i)(newLine)
                }
            }}>
                Check Proof
            </Button>
        </Box>
    );
}