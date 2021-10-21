import { FEATURE_TYPES } from "./constants";

const elements = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Parse Query' },
    position: { x: 50, y: 50 },
    sourcePosition: 'right',
    style: {
      backgroundColor: 'rgb(0, 173, 255)',
      color: 'white',
      height: '35px',
      fontSize: '16px'
    }
  },

  {
    id: '2',
    type: 'default',
    data: { label: 'Select Query Pipeline' },
    targetPosition: 'left',
    sourcePosition: 'right',
    position: { x: 300, y: 50 },
    style: {
      backgroundColor: 'rgb(0, 173, 255)',
      color: 'white',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '3',
    type: 'default',
    data: { label: 'Apply Query Parameters' },
    value: FEATURE_TYPES.QUERY_PARAM_OVERRIDE,
    targetPosition: 'left',
    sourcePosition: 'right',
    position: { x: 550, y: 50 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '4',
    type: 'default',
    data: { label: 'Apply Thesaurus rules' },
    value: FEATURE_TYPES.THESAURUS,
    targetPosition: 'left',
    sourcePosition: 'bottom',
    position: { x: 800, y: 50 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '5',
    type: 'default',
    data: { label: 'Apply Stop words' },
    value: FEATURE_TYPES.STOP_WORD,
    targetPosition: 'top',
    sourcePosition: 'left',
    position: { x: 800, y: 150 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '6',
    type: 'default',
    data: { label: 'Apply Filters rules' },
    value: FEATURE_TYPES.FILTER,
    targetPosition: 'right',
    sourcePosition: 'left',
    position: { x: 550, y: 150 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '7',
    type: 'default',
    data: { label: 'Query ranking expressions' },
    value: FEATURE_TYPES.RANKING,
    targetPosition: 'right',
    sourcePosition: 'left',
    position: { x: 300, y: 150 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '8',
    type: 'default',
    data: { label: 'Apply Featured results' },
    targetPosition: 'right',
    sourcePosition: 'bottom',
    position: { x: 50, y: 150 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '9',
    type: 'default',
    data: { label: 'Apply Ranking weight' },
    value: FEATURE_TYPES.RANKING_WEIGHT,
    targetPosition: 'top',
    sourcePosition: 'right',
    position: { x: 50, y: 250 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '10',
    type: 'default',
    data: { label: 'Apply ML Event Recommendations' },
    targetPosition: 'left',
    sourcePosition: 'right',
    position: { x: 300, y: 250 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '11',
    type: 'default',
    data: { label: 'Apply ML ART' },
    targetPosition: 'left',
    sourcePosition: 'right',
    position: { x: 550, y: 250 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '12',
    type: 'default',
    data: { label: 'Apply ML DNE' },
    targetPosition: 'left',
    sourcePosition: 'bottom',
    position: { x: 800, y: 250 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  },
  {
    id: '13',
    type: 'default',
    data: { label: 'send query to index' },
    targetPosition: 'top',
    sourcePosition: 'left',
    position: { x: 800, y: 350 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      height: '35px',
      fontSize: '16px'
    }
  }, {
    id: '14',
    type: 'output',
    data: { label: 'Apply trigger rules' },
    targetPosition: 'right',
    position: { x: 550, y: 350 },
    style: {
      backgroundColor: '#ededed',
      color: '#333333',
      borderColor: 'black',
      height: '35px',
      fontSize: '16px'
    }
  },

  { id: 'e1-2', source: '1', target: '2', type: 'straight' },
  { id: 'e2-3', source: '2', target: '3', type: 'straight' },
  { id: 'e3-4', source: '3', target: '4', type: 'straight' },
  { id: 'e4-5', source: '4', target: '5', type: 'straight' },
  { id: 'e5-6', source: '5', target: '6', type: 'straight' },
  { id: 'e6-7', source: '6', target: '7', type: 'straight' },
  { id: 'e7-8', source: '7', target: '8', type: 'straight' },
  { id: 'e8-9', source: '8', target: '9', type: 'straight' },
  { id: 'e9-10', source: '9', target: '10', type: 'straight' },
  { id: 'e10-11', source: '10', target: '11', type: 'straight' },
  { id: 'e11-12', source: '11', target: '12', type: 'straight' },
  { id: 'e12-13', source: '12', target: '13', type: 'straight' },
  { id: 'e13-14', source: '13', target: '14', type: 'straight' },


];

export default elements;