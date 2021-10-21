import * as React from 'react';

import { AppBar, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import curlSamples from '../data/curlSamples.json';

export default function RequestLoader() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleClickOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const handleChange = (event) => { setValue(event.target.value); };

  const handleSave = () => {
    window.STATE.curl = value;
    setOpen(false);
  };

  const loadSample = (name) => {
    const sample = Buffer.from(curlSamples[name], 'base64');
    setValue(sample);
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
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
          <div>
            <h3>Samples:</h3>
            <ButtonGroup variant="outlined" aria-label="outlined primary button group">
              <Button onClick={() => loadSample('dellsandbox')} primary  >Dell Sandbox</Button>
              <Button onClick={() => loadSample('fashion')}>Fashion</Button>
            </ButtonGroup>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
