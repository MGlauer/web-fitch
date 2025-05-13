import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Input from '@mui/material/Input';
import FormHelperText from '@mui/material/FormHelperText'
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import * as React from "react";


export default function SentenceComponent({sentence, updateSentence, error}){
    const [inFocus, setInFocus] = React.useState(false)
    const [selectionStart, setSelectionStart] = React.useState();
    const inputRef = React.useRef();

    function updateSelectionStart(event) {
        setSelectionStart(inputRef.current.selectionStart);
    }

    function addCharacter(c){
        function inner(event){
            event.preventDefault()
            updateSentence(sentence.slice(0,selectionStart) + c + sentence.slice(selectionStart))
        }
        return inner;
    }

    function CharButton(c){
        return (<Button key={c} type="button" aria-label={c} onMouseDown={addCharacter(c)}>
            {c}
        </Button>)
    }


    return (
        <Stack direction="column" component="form" sx={{ p: '2px 4px'}}>
            <Input sx={{width: "100%"}}
                   size="small"
                   placeholder="Sentence"
                   id="standard-basic"
                   variant="filled"
                   onChange={(event) => updateSentence(event.target.value)}
                   onFocus={() => setInFocus(true)}
                   onBlur={() => setInFocus(false)}
                   inputRef={inputRef}
                   onSelect={updateSelectionStart}
                   value={sentence}/>
            {inFocus?(<ButtonGroup size="small" >
                {CharButton("\u2227")}
                {CharButton("\u2228")}
                {CharButton("\u2192")}
                {CharButton("\u2194")}
                {CharButton("\u00AC")}
                {CharButton("\u22A5")}
            </ButtonGroup>):<></>}
            <FormHelperText error={true}>{error}</FormHelperText>
        </Stack>)
}