import * as React from 'react';
import { AppBar, Button, Dialog, DialogContent, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import curlHelper from '../utils/curlHelper';

export default function RequestAnalyzer() {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState({ request: {}, response: {} });

  const handleClickOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };


  const analyzeRequest = async () => {
    const cURL = window.STATE.curl;
    console.log('CURL: ', cURL);
    if (!cURL.startsWith('curl')) {
      alert('NOT A VALID CURL');
      return;
    }
    const req = curlHelper.parseCurl(cURL);

    const res = await curlHelper.sendRequest(req);
    setState({ request: req, response: res });
  };

  let parameters = null;
  if (state.request?.data) {
    parameters = Object.entries(state.request?.data).map(([key, value]) => {
      return <TextField
        id={'tf--' + key}
        key={'tf--' + key}
        label={key}
        defaultValue={value}
      />;
    });
  }

  let executionReport = null;
  console.log(state.response, window.STATE.response);
  if (state.response?.executionReport) {
    executionReport = state.response?.executionReport.children.map((row, idx) => {
      return <TableRow key={row.name}>
        <TableCell scope="row">
          {idx}
        </TableCell>
        <TableCell scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.duration}</TableCell>
      </TableRow>;
    });
  }
  console.log(executionReport);
  return (
    <>
      &nbsp; <Button variant="contained" onClick={handleClickOpen}>
        Analyze Request
      </Button>
      <Dialog open={open} onClose={handleClose} fullScreen>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close"><CloseIcon /></IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Request Analyzer
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Button variant="contained" onClick={analyzeRequest}>Analyze</Button>
          <h3>
            Parameters:{state.request?.data && <span>{state.request?.data.length}</span>}
          </h3>
          <div>
            {parameters}
          </div>
          <h3>Execution Report</h3>
          {executionReport && <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Step</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executionReport}
              </TableBody>
            </Table>
          </TableContainer>}
          <h3>Scores</h3>
          <i>soon...</i>
        </DialogContent>
      </Dialog>
    </>
  );
}
