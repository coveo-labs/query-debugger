import * as React from 'react';

import { AppBar, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import curlSamples from '../data/curlSamples.json';

export default function RequestLoader(props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleClickOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const handleChange = (event) => { setValue(event.target.value); };

  const handleSave = () => {
    window.STATE.curl = value;
    props.setPipelines(JSON.parse(window.STATE.pipelines));
    setOpen(false);
  };

  const loadSample = (name) => {
    const req = Buffer.from(curlSamples[name + '__curl'], 'base64').toString();
    const res = Buffer.from(curlSamples[name + '__response'], 'base64').toString();
    const pipelines = Buffer.from(curlSamples[name + '__pipelines'], 'base64').toString();
    //window.STATE.curl = req;
    window.STATE.response = res;
    window.STATE.pipelines = pipelines;
    setValue(req);
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
              <Button onClick={() => loadSample('dellsandbox')} primary  >Dell Sandbox</Button>
              <Button onClick={() => loadSample('fashion')}>Fashion</Button>
            </ButtonGroup>
          </div>
          <DialogContentText>
            Paste your cURL command below
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            margin="dense"
            id="cURL"
            label="cURL command"
            type="text"
            fullWidth
            onChange={handleChange}
            value={value}
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
