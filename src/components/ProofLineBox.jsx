import {parse} from "../fitch/prop/structure.js";
import {Justification, SentenceLine} from "../fitch/proofstructure.js";
import {Rule} from "../fitch/rules.js";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import ErrorIcon from "@mui/icons-material/Error";
import CheckIcon from "@mui/icons-material/Check";


function readLinesText(text){
    let vs = text.split(",");
    console.log(vs)
    for(let i=0; i<vs.length; i++){
        if(vs[i].includes("-")){
            console.log(vs[i])
            let v = vs[i].split("-");
            if(v.length !== 2){
                return {error: "Subproof references need to have shape n-m", text:text}
            }
            else {
                let a = Number(v[0]), b = Number(v[1])
                if(!v[0] || !v[1] || isNaN(a) || isNaN(b))
                    return {error: "Subproof references need to have shape n-m", text:text}
                vs[i] = [a,b]
                console.log([a,b])
            }
        }
    }
    console.log(vs)
    return {text:text, processed:vs}
}

export default function ProofLineBox({lineNum, line, updateFun}) {
    let sentenceLine = line;
    console.log([lineNum, line, updateFun]);
    const handleSentenceChange = (event) => {
        let sen;
        try{
            sen = parse(event.target.value)
        } catch (error) {
            if(error.name==="SyntaxError")
                sen = {text: event.target.value, "error": error.message}
            else
                throw error
        }
        updateFun(new SentenceLine(sen, sentenceLine.justification, sentenceLine.level, sentenceLine.isAssumption));
    };

    const handleSelectChange = (event) => {
        const newJustification = new Justification(Rule.derived[event.target.value], sentenceLine.justification.lines)
        updateFun(new SentenceLine(sentenceLine.sentence, newJustification, sentenceLine.level, sentenceLine.isAssumption));
    };

    const handleLinesChange = (event) => {
        const newJustification = new Justification(sentenceLine.justification.rule, readLinesText(event.target.value))
        updateFun(new SentenceLine(sentenceLine.sentence,  newJustification, sentenceLine.level, sentenceLine.isAssumption));
    };

    let justForm = null;
    if(!sentenceLine.isAssumption){
        justForm =[
            (<Grid size={2}>
                <Select
                    onChange={handleSelectChange}
                    label="Rule"
                    value={sentenceLine.justification.rule.label}
                    variant="standard">
                    { Object.keys(Rule.derived).map((x) => (<MenuItem value={x}>{x}</MenuItem>)) }
                </Select>
            </Grid>),
            (<Grid size={1}>
                <TextField variant="standard" onChange={handleLinesChange} error={sentenceLine.justification.lines.error} helperText={sentenceLine.justification.lines.error?sentenceLine.justification.lines.error:""}>{sentenceLine.justification.lines.text} </TextField>
            </Grid>)
        ]
    } else {
        justForm = <></>
    }

    // Generate proof indicator
    let proofIndicator = undefined
    if (line.error){
        proofIndicator = (<Tooltip title={line.error}>
            <ErrorIcon color="error"/>
        </Tooltip>)
    } else if(line.isValid){
        proofIndicator = (<CheckIcon color="success"/>)
    }
    else {
        console.log([line, proofIndicator])
        proofIndicator = (<></>)
    }

    return (<Paper><Grid container>
        <Grid size={1}>{lineNum}: </Grid>
        <Grid size="grow">
            <TextField sx={{width:"100%"}} id="standard-basic" variant="standard" error={sentenceLine.sentence.error} helperText={sentenceLine.sentence.error?sentenceLine.sentence.error:""} onChange={handleSentenceChange}>{sentenceLine.sentence.text}</TextField>
        </Grid>
        {justForm}
        <Grid size={1}>{proofIndicator}</Grid>
    </Grid></Paper>)
}