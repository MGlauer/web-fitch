import {parse} from "../fitch/structure.js";
import {Justification, SentenceLine} from "../fitch/proofstructure.js";
import {rules, introRules, elimRules, miscRules} from "../fitch/rules.js";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import * as React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckIcon from "@mui/icons-material/Check";
import {IconButton, ListSubheader} from "@mui/material";
import Menu from "@mui/material/Menu";
import SentenceComponent from "./SentenceComponent.jsx";

function readLinesText(text) {
    if(text === "")
        return {text: text, processed: []}
    let vs = text.split(",");
    for (let i = 0; i < vs.length; i++) {
        if (vs[i].includes("-")) {

            let v = vs[i].split("-");
            if (v.length !== 2) {
                return {error: "Subproof references need to have shape n-m", text: text}
            } else {
                let a = Number(v[0]), b = Number(v[1])
                if (!v[0] || !v[1] || isNaN(a) || isNaN(b))
                    return {error: "Subproof references need to have shape n-m", text: text}
                vs[i] = [a-1, b-1]
            }
        }
        else
            if(vs[i] === "")
                vs[i] = null
            else
                vs[i] = Number(vs[i])-1

    }
    return {text: text, processed: vs}
}


export default function ProofLineBox({lineNum, line, removeLine, addLineAfter, addLineBefore, startSubproofAfter, startSubproofBefore, updateFun, hasConstChoice}) {
  
    let sentenceLine = line;

    const [contextMenu, setContextMenu] = React.useState(null);

    const handleContextMenu = (event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );

        // Prevent text selection lost after opening the context menu on Safari and Firefox
        const selection = document.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            setTimeout(() => {
                selection.addRange(range);
            });
        }
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    function updateSentence(text){
        let e = null;
        try {
            parse(text)
        } catch (error) {
            if (error.name === "SyntaxError")
                e = error.message
            else
                throw error
        }
        updateFun(new SentenceLine(text, sentenceLine.justification, sentenceLine.level, sentenceLine.isAssumption, e, null, sentenceLine.newConstant));
    }

    const handleConstantChange = (event) => {
        updateFun(new SentenceLine(sentenceLine.rawString, sentenceLine.justification, sentenceLine.level, sentenceLine.isAssumption, null, null, event.target.value));
    }

    const handleSelectChange = (event) => {
        const newJustification = new Justification(rules.get(event.target.value), sentenceLine.justification.lines)
        updateFun(new SentenceLine(sentenceLine.rawString, newJustification, sentenceLine.level, sentenceLine.isAssumption, sentenceLine.parseError, null, sentenceLine.newConstant));
    };

    const handleLinesChange = (event) => {
        const newJustification = new Justification(sentenceLine.justification.rule, readLinesText(event.target.value))
        updateFun(new SentenceLine(sentenceLine.rawString, newJustification, sentenceLine.level, sentenceLine.isAssumption, sentenceLine.parseError, null, sentenceLine.newConstant));
    };


    let justForm = null;
    if (!sentenceLine.isAssumption) {
        justForm = [
            (<Grid size={2}>
                    <Select
                        onChange={handleSelectChange}
                        label="Rule"
                        value={sentenceLine.justification.rule.label}
                        variant="standard">
                        {[...miscRules.keys()].map((x) => (<MenuItem value={x}>{x}</MenuItem>))}
                        <ListSubheader>Intro</ListSubheader>
                        {[...introRules.keys()].map((x) => (<MenuItem value={x}>{x}</MenuItem>))}
                        <ListSubheader>Elim</ListSubheader>
                        {[...elimRules.keys()].map((x) => (<MenuItem value={x}>{x}</MenuItem>))}
                    </Select>
            </Grid>),
            (<Grid size={1}>
                <TextField variant="filled" onChange={handleLinesChange}
                           label="Lines"
                           size="small"
                           error={sentenceLine.justification.lines.error}
                           helperText={sentenceLine.justification.lines.error ? sentenceLine.justification.lines.error : ""}
                           value={sentenceLine.justification.lines.text?sentenceLine.justification.lines.text:""}/>
            </Grid>)
        ]
    } else {
        justForm = <></>
    }

    // Generate proof indicator
    let proofIndicator = (<></>)
    if(!sentenceLine.isAssumption){
        if (line.ruleError) {
            proofIndicator = (<Tooltip title={line.ruleError}>
                <ErrorIcon color="error"/>
            </Tooltip>)
        } else if (line.isValid) {
            proofIndicator = (<CheckIcon color="success"/>)
        } else {
            proofIndicator = (<></>)
        }
    }

    let constChoice = (<></>)
    if(hasConstChoice){
        constChoice = (
            <Grid sx={{padding:0}}>
                <Select
                    onChange={handleConstantChange}
                    variant="standard"
                    value={sentenceLine.newConstant}>
                    {["", "a", "b", "c", "d", "e"].map((x) =>  (<MenuItem value={x}>{x}</MenuItem>))}
                </Select>
            </Grid>

        )
    }

    return (
        <Box sx={{width: 1}} onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
            <Grid sx={{justifyContent: "flex-end", alignItems: "flex-end", padding: 0}} container>
                {constChoice}
                <Grid size="grow">
                    <SentenceComponent sentence={sentenceLine.rawString} updateSentence={updateSentence} error={sentenceLine.parseError}/>
                </Grid>
                {justForm}
                <Grid size={1}>{proofIndicator}</Grid>
                <IconButton onClick={removeLine}>
                    <DeleteForeverIcon/>
                </IconButton>
                <Grid size={1}>{lineNum} </Grid>
            </Grid>
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem disabled={removeLine===undefined} onClick={() => {handleClose();removeLine()}}>Delete Line</MenuItem>
                <MenuItem disabled={addLineBefore===undefined} onClick={() => {handleClose();addLineBefore()}}>Add Line Before</MenuItem>
                <MenuItem disabled={addLineAfter===undefined} onClick={() => {handleClose();addLineAfter()}}>Add Line After</MenuItem>
                <MenuItem disabled={startSubproofBefore===undefined} onClick={() => {handleClose();startSubproofBefore()}}>Start Subproof Before</MenuItem>
                <MenuItem disabled={startSubproofAfter===undefined} onClick={() => {handleClose();startSubproofAfter()}}>Start Subproof After</MenuItem>
            </Menu>
        </Box>)
}