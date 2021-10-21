import * as React from 'react';
import { AppBar, Button, Dialog, DialogContent, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import curlHelper from '../utils/curlHelper';
const REQUEST_TRANSLATORS = [
  { from: 'q', to: 'query' },
  { from: 'locale', to: 'language' },
  { from: 'aq', to: 'advancedQuery' },
  { from: 'dq', to: 'disjunctionQuery' }
];
export default function RequestAnalyzer(props) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState({ request: {}, response: {}, pipelines: [] });

  const handleClickOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const checkQueryField = (condition) => {
    let fieldFound = false;
    let result = false;
    Object.entries(state.request?.data).forEach(([key, value]) => {
      let fieldValue = `\\$${key}`;
      const regex = new RegExp(fieldValue);
      //Check if fieldValue is within condition
      if (regex.test(String(condition))) {
        fieldFound = true;
        //console.log("Condition contains field: " + fieldValue);
        try {
          let expression = condition.replaceAll(`$${key}`, value);
          console.log(expression);
          result = eval(expression);
        }
        catch (e) {
          console.log(e);
          result = false;
        }
      }
    });
    if (fieldFound) {
      return result;
    }
    return false;
  };

  const checkCondition = (condition) => {
    //Checks if condition is met by the query
    if (condition) {
      let conditionToCheck = condition.clean_definition;
      if (conditionToCheck !== "") {
        let result = checkQueryField(conditionToCheck);
        return result ? "Yes" : "No";
      }
    } else return "No condition set";
  };

  const checkInExecReport = (condition) => {
    //Checks if condition inside execution report
    if (condition) {
      let conditionToCheck = condition.clean_definition;
      if (conditionToCheck !== "") {
        let result = checkQueryField(conditionToCheck);
        return result ? "Yes" : "No";
      }
    } else return "No condition set";
  };

  const addRequestTranslators = (req) => {
    REQUEST_TRANSLATORS.forEach(field => {
      try {
        req.data[field.to] = req.data[field.from];
      }
      catch (e) {
      }
    });
    return req;
  };

  const analyzeRequest = async () => {
    const cURL = window.STATE.curl;
    console.log('CURL: ', cURL);
    if (!cURL.startsWith('curl')) {
      alert('NOT A VALID CURL');
      return;
    }

    let req = curlHelper.parseCurl(cURL);
    req = addRequestTranslators(req);

    const response = await curlHelper.sendRequest(req);
    console.log(response);

    let pipelines = [];
    try {
      console.log(window.STATE.pipelines);
      pipelines = JSON.parse(window.STATE.pipelines);
    }
    catch (e) {
      console.log(e);
    }
    setState({ request: req, response, pipelines });
  };

  let parameters = null;
  let finalAnalysis = {};
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

  let pipelineReport = null;
  //console.log(state.pipelines);
  let pipelineSelected = false;
  let pipelineName = '';
  if (state.pipelines.length > 0) {
    console.log("Render pipelines");
    pipelineReport = state.pipelines.map((row, idx) => {
      if (!row.isDefault) {
        let valid = checkCondition(row.condition);
        let conditionUsed = "No";
        state.pipelines[idx]['used'] = false;
        state.pipelines[idx]['valid'] = false;
        if (valid === "Yes") {
          if (pipelineSelected === false) {
            pipelineSelected = true;
            pipelineName = row.name;
            conditionUsed = "Yes";
            state.pipelines[idx]['used'] = true;
          }
          state.pipelines[idx]['valid'] = true;
        }
        return <TableRow key={row.id} class={'used' + state.pipelines[idx]['used'] + ' valid' + state.pipelines[idx]['valid']}>
          <TableCell scope="row">
            {idx + 1}
          </TableCell>
          <TableCell scope="row">
            {row.name}
          </TableCell>
          <TableCell align="left">{row.condition?.definition}</TableCell>
          <TableCell align="left">{row.condition?.clean_definition}</TableCell>
          <TableCell align="right">{valid}</TableCell>
          <TableCell align="right">{conditionUsed}</TableCell>
        </TableRow>;
      }
      return null;
    });
  }
  //If no pipeline selected: find the default one
  let pipelineReportDefault = null;

  if (!pipelineSelected) {
    if (state.pipelines.length > 0) {
      console.log("Render default pipelines");
      pipelineReportDefault = state.pipelines.map((row, idx) => {
        if (row.isDefault) {
          let valid = checkCondition(row.condition);
          let conditionUsed = "Yes";
          state.pipelines[idx]['used'] = true;
          state.pipelines[idx]['valid'] = false;
          pipelineName = row.name;
          if (valid === "Yes") {
            state.pipelines[idx]['valid'] = true;
          }
          return <TableRow key={row.id} class={'used' + state.pipelines[idx]['used'] + ' valid' + state.pipelines[idx]['valid']}>
            <TableCell scope="row">
              {idx + 1}
            </TableCell>
            <TableCell scope="row">
              {row.name}
            </TableCell>
            <TableCell align="left">{row.condition?.definition}</TableCell>
            <TableCell align="left">{row.condition?.clean_definition}</TableCell>
            <TableCell align="right">{valid}</TableCell>
            <TableCell align="right">{conditionUsed}</TableCell>
          </TableRow>;
        }
        return null;
      });
    }
  }
  console.log(pipelineReportDefault);

  //Add pipeline final analysis
  //finalAnalysis['Pipeline Validation']=state.request?.data['pipeline']==pipelineName;


  let pipelineReportDetails = null;
  //continue with the pipeline analysis
  if (state.pipelines.length > 0) {
    console.log("Render default pipelines");
    state.pipelines.forEach((row, idx) => {
      if (state.pipelines[idx]['used'] === true) {
        console.log(state.pipelines[idx].statements);
        pipelineReportDetails = state.pipelines[idx].statements.map((statement, idxs) => {
          let valid = checkCondition(statement.condition);
          let conditionUsed = "No";
          state.pipelines[idx].statements[idxs]['valid'] = false;
          state.pipelines[idx].statements[idxs]['used'] = false;
          state.pipelines[idx].statements[idxs]['inExecutionReport'] = checkInExecReport(statement.condition);
          if (valid === "Yes") {
            state.pipelines[idx].statements[idxs]['valid'] = true;
            state.pipelines[idx].statements[idxs]['used'] = true;
            conditionUsed = "Yes";
          }
          //If no condition, always used
          if (!statement.condition) {
            valid = "Yes";
            state.pipelines[idx].statements[idxs]['used'] = true;
            conditionUsed = "Yes";
          }
          return <TableRow key={statement.id} class={'valid' + state.pipelines[idx].statements[idxs]['valid'] + ' used' + state.pipelines[idx].statements[idxs]['used']}>
            <TableCell scope="row">
              {idxs + 1}
            </TableCell>
            <TableCell scope="row">
              {statement.feature} - {statement.definition}
            </TableCell>
            <TableCell align="left">{statement.condition?.definition}</TableCell>
            <TableCell align="left">{statement.condition?.clean_definition}</TableCell>
            <TableCell align="right">{valid}</TableCell>
            <TableCell align="right">{conditionUsed}</TableCell>
          </TableRow>;
        });
      }
    });

    props.setPipelines(state.pipelines);
    window.STATE.pipelines = state.pipelines;
  }
  let executionReport = null;
  //console.log(state.response, window.STATE.response);
  if (state.response?.executionReport) {
    const total = state.response.duration;
    executionReport = state.response?.executionReport.children.map((row, idx) => {
      return <TableRow key={row.name}>
        <TableCell scope="row">
          {idx}
        </TableCell>
        <TableCell scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.duration} <LinearProgress variant="determinate" value={row.duration * 100 / total} /></TableCell>
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
          <h3>Pipeline Report</h3>
          {pipelineReport && <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650, maxWidth: 850, wordBreak: 'break-word', overflowWrap: 'break-word' }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 50 }}></TableCell>
                  <TableCell style={{ width: 200 }}>Name</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Check Condition</TableCell>
                  <TableCell style={{ width: 100 }}>Meets Query</TableCell>
                  <TableCell style={{ width: 50 }}>Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pipelineReport}
                {pipelineReportDefault}
              </TableBody>
            </Table>
          </TableContainer>}
          <h3>Selected Pipeline Report</h3>
          {pipelineReportDetails && <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650, maxWidth: 850, wordBreak: 'break-word', overflowWrap: 'break-word' }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: 50 }}></TableCell>
                  <TableCell style={{ width: 200 }}>Name</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Check Condition</TableCell>
                  <TableCell style={{ width: 50 }}>Meets Query</TableCell>
                  <TableCell style={{ width: 50 }}>Used</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pipelineReportDetails}
              </TableBody>
            </Table>
          </TableContainer>}
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
