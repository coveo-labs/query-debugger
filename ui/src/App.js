import React, { useEffect, useState } from 'react';
import './App.css';
import ReactFlow from 'react-flow-renderer';
import initialElements from './utils/elements';


const App = () => {
  const [elements, setElements] = useState(initialElements);
  const [nodeName, setNodeName] = useState('Select Query Pipeline');
  useEffect(() => {
    setElements((els) =>
      els.map((el) => {
        if (el.id === '2') {
          el.data = {
            ...el.data,
            label: nodeName,
          };
        }

        return el;
      })
    );
  }, [nodeName, setElements]);



  return (
    <>
      <div style={{ textAlign: 'center' }}><h1>Query Debugger</h1></div>
      <div style={{ margin: 'auto', height: 400 }}>
        <ReactFlow elements={elements}>
        </ReactFlow>
      </div>
      <div style={{ height: '280px', border: '2px solid black', margin: '2%' }}>
        <div className="updatenode__controls">
          <label>label:</label>
          <input
            value={nodeName}
            onChange={(evt) => setNodeName(evt.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default App;
