import * as React from 'react'
import './App.css'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import FitchBox from "./components/FitchBox.jsx";
import LatexBox from "./components/LatexBox.jsx";
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function CustomTabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function App() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const [premisesEnd, setPremisesEnd] = React.useState(0);
    const [lines, setLines] = React.useState([]);

    return (
        <Box sx={{width: '100%'}}>
            <Typography variant="h3">WebFitch<Typography variant="caption">(v{APP_VERSION})</Typography></Typography>
            <Box>
                If you find any bugs or have any other requests, feel free to let us know on <a href="https://github.com/MGlauer/web-fitch/issues">GitHub</a>. Note: You can also add new lines or subproofs by right-clicking an existing line.
            </Box>
            <Paper sx={{width: '100%'}}>
                <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Proof" {...a11yProps(0)} />
                        <Tab label="Latex" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <FitchBox premisesEnd={premisesEnd} setPremisesEnd={setPremisesEnd} lines={lines} setLines={setLines}/>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <LatexBox premisesEnd={premisesEnd} lines={lines}/>
                </CustomTabPanel>
            </Paper>
        </Box>
    )
}


export default App
