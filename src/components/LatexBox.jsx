import {generateLatexProof, collateSubproofs} from "../fitch/structure.js"
import Button from "@mui/material/TextField";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function LatexBox({premisesEnd, lines}){


    return (
        <Box>
            <Typography> This latex export is based on the Latex library developed by Michael Rieppel accessible <a href={"https://mrieppel.github.io/fitchjs/samples/fitch.sty"}>here</a>.</Typography>
            <TextField sx={{width:1}} multiline disabled value={generateLatexProof(lines.slice(0,premisesEnd), collateSubproofs(lines.slice(premisesEnd))).join("\n")} />
        </Box>
    )
}