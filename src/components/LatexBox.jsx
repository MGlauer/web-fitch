import {generateLatexProof, collateSubproofs} from "../fitch/structure.js"
import Button from "@mui/material/TextField";
import TextField from "@mui/material/TextField";

export default function LatexBox({premisesEnd, lines}){
    return (
        <TextField multiline disabled value={generateLatexProof(lines.slice(0,premisesEnd), collateSubproofs(lines.slice(premisesEnd))).join("\n")} />
    )
}