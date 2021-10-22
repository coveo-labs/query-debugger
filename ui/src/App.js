import React, { useEffect, useState } from 'react';
import './App.css';
import ReactFlow from 'react-flow-renderer';
import { FormControl, InputLabel, MenuItem, Grid, Select } from '@mui/material';
import initialElements from './utils/elements';
import Details from './Components/Details';
import RequestLoader from './Components/RequestLoader';
import RequestAnalyzer from './Components/RequestAnalyzer';

// OK, this is cheating and bad, I know...
// should use a proper React Context, just taking a shortcut for now
window.STATE = { ...window.STATE, curl: '' };

const App = () => {
  const [pipelineData, setPipelineData] = useState([]);
  const [elements, setElements] = useState(initialElements);
  const [queryPipeline, setQueryPipeline] = useState('');
  const [report, setReport] = useState('');
  const [selectedPipelineData, setSelectedPipelineData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  useEffect(() => {
    const updateElement = initialElements;
    setReport('No of pipelines retrieved: '+pipelineData.length);

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
        if (selectedPipelineData.some(e => el.data?.value && e.feature === el.data.value)) {
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
  }, [selectedPipelineData, queryPipeline, pipelineData]);

  const onPipelineSelect = (event) => {
    setQueryPipeline(event.target.value);
    setSelectedPipelineData(pipelineData.find(data =>
      data.name === event.target.value).statements);
  };

  const onElementClick = (event, element) => {
    const featureData = selectedPipelineData.filter((data) => element.data.value &&
      data.feature === element.data.value);
    setFeatureData([...featureData]);
  };
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>Query Debugger</h1>
      <h3 style={{ textAlign: 'center' }}>{String(report)}</h3>
      <div style={{ marginLeft: '1%' }}>
        <RequestLoader setPipelines={setPipelineData} />
        <RequestAnalyzer />
      </div>
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
              {pipelineData && pipelineData.map((data) => <MenuItem value={data.name}>{data.name}</MenuItem>)}
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
              onElementClick={onElementClick}
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
          <Details featureData={featureData} />
        </Grid>
      </Grid>
    </>
  );
};

export default App;
