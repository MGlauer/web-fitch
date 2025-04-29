import * as React from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {Sentence} from './fitch/prop/structure'
import {Rule} from './fitch/prop/rules'
import {Proof, SentenceLine, Justification} from './fitch/proofstructure.js'
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

let warn = console.warn;
console.warn = function(warning) {
    if (/(Invalid prop|Failed propType)/.test(warning)) {
        throw new Error(warning);
    }
    warn.apply(console, arguments);
};

export default function FitchBox() {
    return (
        <ProofBox/>
    );
}

function ProofBox() {
    const [premisesEnd, setPremisesEnd] = React.useState(0);
    const [lines, setLines] = React.useState([]);


    for(let i= premisesEnd; i<lines.length; i++) {
        lines[i].check(lines);
    }

    return (
        <Box>
            <Stack>
                {lines.entries().toArray().slice(0,premisesEnd).map(([i,x]) => resolveLine(i+1, x,false))}
            </Stack>
            <Button onClick={() => {
                setPremisesEnd(premisesEnd+1)
                setLines([...lines.slice(0,premisesEnd), new SentenceLine(new Sentence(),null), ...lines.slice(premisesEnd)]);
            }}
            >+</Button>
            <hr />
            <Stack>
                {lines.entries().toArray().slice(premisesEnd).map(([i,x]) => resolveLine(i+1, x,true))}
            </Stack>
            <Button onClick={() => {
                setLines([...lines, new SentenceLine(new Sentence(),null)]);
                }}
            >+</Button>
        </Box>


    );
}

function resolveLine(lineNum, line, requiresJustification) {
    let inner = undefined
    if (line.constructor.name === "Proof") {
        inner = (<ProofBox sentence={line}/>)
    }
    else if(line.constructor.name === "SentenceLine"){
        inner = (<ProofSentenceLine sentenceline={line} requiresJustification={requiresJustification}/>)
    } else
        throw "Unknown line type"
    return (<Stack direction="row">
        <>{lineNum}: </>
        {inner}
    </Stack>)
}

function ProofSentenceLine(props) {
    let sentenceline = props.sentenceline
    let requiresJustification = props.requiresJustification
    return (
        <Stack direction="row">
                <TextField id="standard-basic" variant="standard" >{sentenceline.sentence.render()}</TextField>
                {requiresJustification?(<JustificationForm props={sentenceline.justification} />):(<></ >)}
        </Stack>
    );
}

function JustificationForm(props) {

    const [rule, setRule] = React.useState(0);
    const [lineRefs, setLineRefs] = React.useState("");
    const handleChange = (event) => {
        setRule(event.target.label);
    };

    return (
            <Grid container spacing={2} columns={3}>
                <Grid size={2}>
                    <Select
                        onChange={handleChange}
                        label="Rule"
                        variant="standard">
                        { Rule.derived.map((x) => (<MenuItem value={x.label}>{x.label}</MenuItem>)) }
                    </Select>
                </Grid>
                <Grid size={1}>
                    <TextField variant="standard" />
                </Grid>
            </Grid>
    );
}