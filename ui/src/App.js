import React, { useEffect, useState } from 'react';
import './App.css';
import ReactFlow from 'react-flow-renderer';
import { FormControl, InputLabel, MenuItem, Grid, Select } from '@mui/material';
import pipelineData from './data/pipelines.json';
import initialElements from './utils/elements';
import Details from './Components/Details';


const App = () => {
  const [elements, setElements] = useState(initialElements);
  const [queryPipeline, setqueryPipeline] = useState('');
  const [selectedPipelineData, setSelectedPipelineData] = useState(pipelineData.find(data => data.name === queryPipeline)?.statements ?? []);

  useEffect(() => {
    const updateElement = initialElements;
    updateElement.map((el) => {
      if (el.id === 'start') {
        el = { ...el };
      }
      if (el.id === 'pipeline') {
        el.data = {
          ...el.data,
          label: queryPipeline ? 'Pipeline:\n' + queryPipeline : 'Select a Query Pipeline',
        };
      } else if (selectedPipelineData.length > 0) {
        if (selectedPipelineData.some(e => e.feature === el.value)) {
          el.className = 'node-highlight';
        } else {
          el.className = 'node-default';
        }
      } else {
        el.className = 'node-default';
      }
      return el;
    });
    setElements([...updateElement]);
  }, [selectedPipelineData, queryPipeline]);

  const onPipelineSelect = (event) => {
    setqueryPipeline(event.target.value);
    setSelectedPipelineData(pipelineData.find(data => data.name === event.target.value).statements);
  };

  return (
    <>
      <div style={{ textAlign: 'center' }}><h1>Query Debugger</h1></div>
      <Grid container>
        <Grid item xs={12} md={12} lg={12} style={{ textAlign: 'end', marginRight: '2%' }}>
          <FormControl style={{ width: '200px' }}>
            <InputLabel id="demo-simple-select-label">Select Query Pipeline</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={queryPipeline}
              label="Select Query Pipeline"
              onChange={onPipelineSelect}
            >
              {pipelineData.map((data) => <MenuItem value={data.name}>{data.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <div style={{ margin: 'auto', height: 450, width: 1000 }}>
            <ReactFlow elements={elements}
              maxZoom={1}
              minZoom={1}
              defaultZoom={1}
              elementsSelectable={true}
              // onElementClick={captureElementClick ? onElementClick : undefined}
              nodesConnectable={false}
              nodesDraggable={false}
              zoomOnScroll={false}
              panOnScroll={false}
              zoomOnDoubleClick={false}
              paneMoveable={false}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <Details />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
