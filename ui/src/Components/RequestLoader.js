import * as React from 'react';

import { AppBar, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import CloseIcon from '@mui/icons-material/Close';
import { PlatformClient, Environment, Region } from '@coveord/platform-client';

import curlSamples from '../data/curlSamples.json';
import curlHelper from '../utils/curlHelper';
import Pipelines from '../utils/Pipelines.js';

export default function RequestLoader(props) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState('');
  const [cURL, setcURL] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const handleClickOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const handleChange = (event) => { setcURL(event.target.value); };

  const createPlatformClient = (request) => {

    let environment = Environment.prod;
    let region = Region.US;

    const endpoint = (request.headers ?.authority || '').toLowerCase();

    if (endpoint.startsWith('platformqa')) environment = Environment.staging;
    else if (endpoint.startsWith('platformdev')) environment = Environment.dev;
    else if (endpoint.startsWith('platformhipaa')) environment = Environment.hipaa;

    if ((/^platform\w*-au/i).test(endpoint)) region = Region.AU;
    else if ((/^platform\w*-eu/i).test(endpoint)) region = Region.EU;

    const bearer = request.headers ?.authorization || '';
    let apiKeyOrToken = bearer.replace(/^Bearer\s+/gi, '').trim();

    console.log(request.queries ?.organizationId);
    console.log(apiKeyOrToken);
    return new PlatformClient({
      accessToken: apiKeyOrToken || 'Missing-Token',
      organizationId: request.queries ?.organizationId,
      environment,
      region,
    });
  };

  const handleSave = () => {
    window.STATE.curl = cURL;
    //console.log(window.STATE.pipelines);
    //props.setPipelines(JSON.parse(window.STATE.pipelines));
    props.setPipelines(window.STATE.pipelines);
    setOpen(false);
  };

  const showProgress = (value) => {
    let errorMessage = error;
    if (value) {
      return (
        <Box sx={{ width: '100%', padding: '10px' }}>
          <b>Collecting Content from Coveo Platform, please wait</b>
          <LinearProgress sx={{ marginTop: '10px', marginBottom: '10px', padding: '5px' }} />
        </Box>
      );
    }
    else return (
      <Typography sx={{ ml: 2, flex: 1, color: 'red' }} variant="h6" component="div">
        {String(errorMessage)}
      </Typography>
    );
  }

  const loadSample = (name) => {
    if (name !== 'CURL') {
      const req = Buffer.from(curlSamples[name + '__curl'], 'base64').toString();
      const res = Buffer.from(curlSamples[name + '__response'], 'base64').toString();
      const pipelines = Buffer.from(curlSamples[name + '__pipelines'], 'base64').toString();
      //window.STATE.curl = req;
      window.STATE.response = res;
      window.STATE.pipelines = JSON.parse(pipelines);
      setcURL(req);
    } else {
      //Load it using the apikey and org from curl request
      setError('');
      setBusy(true);
      try {
        let req = curlHelper.parseCurl(cURL);
        const platformClient = createPlatformClient(req);

        const pipelines = new Pipelines(platformClient);
        console.log('Getting QPLs');
        pipelines.getQPL().then(content => {
          console.log(content);
          if (content.length == 0) {
            setBusy(false);
            setError('Something went wrong, no content could be retrieved. Check the console for error message.');
          } else {
            window.STATE.pipelines = content;
            //setcURL(req);
            setBusy(false);
            handleSave();
          }
        });
      }
      catch (e) {
        setBusy(false);
        setError('Something went wrong, no content could be retrieved. Check the console for error message.');

      }
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleClickOpen}>
        Set cURL request
      </Button>
      <Dialog open={open} onClose={handleClose} fullScreen>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close"><CloseIcon /></IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Request
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSave}>Save</Button>
          </Toolbar>
        </AppBar>

        <DialogContent>
          <div>
            <h3>Samples:</h3>
            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
              <Button onClick={() => loadSample('fashion')}>Fashion</Button>
            </ButtonGroup>
            <h3>New request:</h3>
            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
              <Button onClick={() => loadSample('CURL')}>Based on the info in the curl request (use a Content Browser curl command)</Button>
            </ButtonGroup>
          </div>
          <h3>cURL command:</h3>
          <DialogContentText>
            Paste your cURL command below (windows: copy as cURL - bash ):
          </DialogContentText>
          {showProgress(busy)}
          <TextField
            autoFocus
            multiline
            margin="dense"
            id="cURL"
            label="cURL command"
            type="text"
            fullWidth
            onChange={handleChange}
            value={cURL}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
