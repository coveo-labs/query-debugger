import * as React from 'react';
import { AppBar, Button, Dialog, DialogContent, IconButton, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function RequestAnalyzer() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => { setOpen(true); };
  const handleClose = () => { setOpen(false); };

  const analyzeRequest = () => {
    alert('soon...');
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
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
          <Button onClick={analyzeRequest}>Analyze</Button>
          <h3>Execution Report</h3>
          <i>soon...</i>
          <h3>Scores</h3>
          <i>soon...</i>
        </DialogContent>
      </Dialog>
    </>
  );
}
