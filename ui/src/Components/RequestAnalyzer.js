import React, { useEffect, useState } from 'react';
import { AppBar, Button, Dialog, DialogContent, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactJson from "react-json-view";

import curlHelper from '../utils/curlHelper';
const REQUEST_TRANSLATORS = [
  { from: 'q', to: 'query' },
  { from: 'locale', to: 'language' },
  { from: 'aq', to: 'advancedQuery' },
  { from: 'dq', to: 'disjunctionQuery' }
];
export default function RequestAnalyzer(props) {
  const [open, setOpen] = React.useState(false);
  const [json, setJSON] = React.useState({});
  const [jsonT, setJSONT] = React.useState({});
  const [state, setState] = React.useState({ request: {}, response: {}, pipelines: [] });

  const handleClickOpen = () => { 
    setState({ request: {}, response: {}, pipelines: [] });
    setOpen(true); };
  const handleClose = () => { setOpen(false); };
  useEffect(() => {
    setJSON(jsonT);
  }, [jsonT]);

  const checkQueryField = (condition) => {
    let fieldFound = false;
    let result = false;
    Object.entries(state.request ?.data).forEach(([key, value]) => {
      let fieldValue = `\\$${key}`;
      const regex = new RegExp(fieldValue);
      //Check if fieldValue is within condition
      if (regex.test(String(condition))) {
        fieldFound = true;
        //console.log("Condition contains field: " + fieldValue);
        try {
          let expression = condition.replaceAll(`$${key}`, value);
          //console.log(expression);
          result = eval(expression);
        }
        catch (e) {
          console.log(condition.replaceAll(`$${key}`, value));
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
      //console.log(condition.definition);
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

  const whatToDisplay = (field) => {
    let returnValue = true;
    //console.log(field);
    if (field) {
      if (field.name === false) returnValue = false;
      let name = String(field.name);
      try {
        if (name.indexOf('Pipeline details') === -1 && field.namespace.length == 3 && String(field.namespace[1]) === 'Pipeline details') returnValue = false;
      }
      catch (e) {

      }
      if (name==='Query Pipeline') returnValue = false;
      if (name.indexOf('Pipeline details') != -1) returnValue = false;
      if (name.indexOf(' (selected)') != -1) returnValue = false;
      if (name.indexOf(' (valid)') != -1) returnValue = false;
      name = String(field.src.name);
      if (name.indexOf(' (selected)') != -1) returnValue = false;
      if (name.indexOf(' (valid)') != -1) returnValue = false;
    }
    //Check if field is an array
    if (field['Query Pipelines'] !== undefined) {

    }
    return returnValue;
  };

  const handleCopy = (copy) => {
    navigator.clipboard.writeText(JSON.stringify(copy.src, null, "\t"));
  };

  const analyzeRequest = async () => {
    const cURL = props.curl;
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
      console.log('Current pipelines:');
      pipelines=props.pipes;
      console.log(pipelines);
      //pipelines = window.STATE.pipelines;//JSON.parse(window.STATE.pipelines);
    }
    catch (e) {
      console.log(e);
    }
    setState({ request: req, response, pipelines });
  };

  let parameters = null;
  let finalAnalysis = {};
  if (state.request ?.data) {
    parameters = Object.entries(state.request ?.data).map(([key, value]) => {
      return <TextField
        id={'tf--' + key}
        key={'tf--' + key}
        label={key}
        value={value}
        defaultValue={value}
      />;
    });
  }

  let pipelineSelected = false;
  let pipelineName = '';
  let allJson = {};
  let qplJson = [];
  let qplSelJson = {};

  const getPipelineReport = () => {
    let pipelineReport = null;

    //console.log(state.pipelines);
    if (state.pipelines.length > 0) {
      console.log("Render pipelines");
      pipelineReport = state.pipelines.map((row, idx) => {
        if (!row.isDefault) {
          let valid = checkCondition(row.condition);
          let jsonContent = {};
          let addToGlobalJson=true;

          jsonContent['definition'] = row.condition ?.definition;
          let conditionUsed = "No";
          state.pipelines[idx]['used'] = false;
          state.pipelines[idx]['valid'] = false;
          if (valid === "Yes") {
            if (pipelineSelected === false) {
              pipelineSelected = true;
              pipelineName = row.name;
              jsonContent['name'] = row.name + ' (selected)';
              conditionUsed = "Yes";
              state.pipelines[idx]['used'] = true;
              qplSelJson = jsonContent;
              addToGlobalJson=false;
            }
            state.pipelines[idx]['valid'] = true;
            jsonContent['name'] = row.name + ' (valid)';

          } else {
            jsonContent['name'] = row.name;
          }
          if (addToGlobalJson) qplJson.push(jsonContent);
          return <TableRow key={row.id} class={'used' + state.pipelines[idx]['used'] + ' valid' + state.pipelines[idx]['valid']}>
            <TableCell scope="row">
              {idx + 1}
            </TableCell>
            <TableCell scope="row">
              {row.name}
            </TableCell>
            <TableCell align="left">{row.condition ?.definition}</TableCell>
            <TableCell align="left">{row.condition ?.clean_definition}</TableCell>
            <TableCell align="right">{valid}</TableCell>
            <TableCell align="right">{conditionUsed}</TableCell>
          </TableRow>;
        }
        return null;
      });
    }
    return pipelineReport;
  }

  //If no pipeline selected: find the default one
  const getPipelineReportDefault = () => {
    let pipelineReportDefault = null;

    if (!pipelineSelected) {
      if (state.pipelines.length > 0) {
        console.log("Render default pipelines");
        pipelineReportDefault = state.pipelines.map((row, idx) => {
          if (row.isDefault) {
            let valid = checkCondition(row.condition);
            let jsonContent = {};

            jsonContent['definition'] = row.condition ?.definition;
            let conditionUsed = "Yes";
            state.pipelines[idx]['used'] = true;
            state.pipelines[idx]['valid'] = false;
            pipelineName = row.name;
            jsonContent['name'] = row.name + ' (selected)';
            qplSelJson = jsonContent;
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
              <TableCell align="left">{row.condition ?.definition}</TableCell>
              <TableCell align="left">{row.condition ?.clean_definition}</TableCell>
              <TableCell align="right">{valid}</TableCell>
              <TableCell align="right">{conditionUsed}</TableCell>
            </TableRow>;
          }
          return null;
        });
      }
    }
    // add to json
    allJson['Query Pipeline'] = qplSelJson;
    return pipelineReportDefault;
  }
  let featureJson = {};
  //Add pipeline final analysis
  //finalAnalysis['Pipeline Validation']=state.request?.data['pipeline']==pipelineName;

  const getPipelineReportDetails = () => {
    let pipelineReportDetails = null;

    //continue with the pipeline analysis
    if (state.pipelines.length > 0) {
      console.log("Render default pipelines");
      state.pipelines.forEach((row, idx) => {
        if (state.pipelines[idx]['used'] === true) {
          console.log(state.pipelines[idx].statements);
          pipelineReportDetails = state.pipelines[idx].statements.map((statement, idxs) => {
            let curJson = {};
            let valid = checkCondition(statement.condition);
            curJson['condition'] = statement.condition ?.definition;
            curJson['name'] = statement.definition;
            let conditionUsed = "No";
            state.pipelines[idx].statements[idxs]['valid'] = false;
            state.pipelines[idx].statements[idxs]['used'] = false;
            state.pipelines[idx].statements[idxs]['inExecutionReport'] = checkInExecReport(statement.condition);
            if (valid === "Yes") {
              curJson['name'] += ' (valid)';
              state.pipelines[idx].statements[idxs]['valid'] = true;
              state.pipelines[idx].statements[idxs]['used'] = true;
              conditionUsed = "Yes";
            }
            //If no condition, always used
            if (!statement.condition) {
              valid = "Yes";
              curJson['name'] += ' (valid)';
              state.pipelines[idx].statements[idxs]['used'] = true;
              conditionUsed = "Yes";
            }
            if (featureJson[statement.feature] == undefined) {
              featureJson[statement.feature] = [];
            }
            featureJson[statement.feature].push(curJson);
            return <TableRow key={statement.id} class={'valid' + state.pipelines[idx].statements[idxs]['valid'] + ' used' + state.pipelines[idx].statements[idxs]['used']}>
              <TableCell scope="row">
                {idxs + 1}
              </TableCell>
              <TableCell scope="row">
                {statement.feature} - {statement.definition}
              </TableCell>
              <TableCell align="left">{statement.condition ?.definition}</TableCell>
              <TableCell align="left">{statement.condition ?.clean_definition}</TableCell>
              <TableCell align="right">{valid}</TableCell>
              <TableCell align="right">{conditionUsed}</TableCell>
            </TableRow>;
          });
        }
      });
    }
    if (state.pipelines.length > 0) {
      console.log('Setting new pipelines');
      allJson['Pipeline details'] = featureJson;
      allJson['Query Pipelines Others'] = qplJson;

      props.setPipelines(state.pipelines);
      window.STATE.pipelines = state.pipelines;
      //setJSONT(allJson);
    }
    return pipelineReportDetails;
  }

  const getJSONData = () => {
    return allJson;
  }
  const getExecutionReport = () => {
    let executionReport = null;
    //console.log(state.response, window.STATE.response);
    if (state.response ?.executionReport) {
      const total = state.response.duration;
      executionReport = state.response ?.executionReport.children.map((row, idx) => {
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
    return executionReport;
  }

  const jsonStyle = {
    backgroundColor: "#000"
  };

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
            Parameters:{state.request ?.data && <span>{state.request ?.data.length}</span>}
          </h3>
          <div>
            {parameters}
          </div>
          <ReactJson
            name={false}
            src={getJSONData()}
            style={jsonStyle}
            theme="monokai"
            iconStyle="square"
            enableClipboard={false}
            onEdit={false}
            onDelete={false}
            onAdd={false}
            displayDataTypes={false}
            shouldCollapse={whatToDisplay}
            groupArraysAfterLength={1000}
            collapseStringsAfterLength={250}
          />
          <h3>Pipeline Report</h3>
          <TableContainer component={Paper}>
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
                {getPipelineReport()}
                {getPipelineReportDefault()}
              </TableBody>
            </Table>
          </TableContainer>
          <h3>Selected Pipeline Report</h3>
          <TableContainer component={Paper}>
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
                {getPipelineReportDetails()}
              </TableBody>
            </Table>
          </TableContainer>
          <h3>Execution Report</h3>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Step</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getExecutionReport()}
              </TableBody>
            </Table>
          </TableContainer>
          <h3>Scores</h3>
          <i>soon...</i>
        </DialogContent>
      </Dialog>
    </>
  );
}
