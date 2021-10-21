import { FEATURE_TYPES } from "./constants";

const elements = [
  {
    id: 'start',
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
    id: 'pipeline',
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
    id: 'queryParameters',
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
    id: 'thesaurus',
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
    id: 'stopWords',
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
    id: 'filters',
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
    id: 'qre',
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
    id: 'featuredResults',
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
    id: 'rankingWeights',
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
    id: 'mlRecommendations',
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
    id: 'mlART',
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
    id: 'mlDNE',
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
    id: 'queryIndex',
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
    id: 'triggers',
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

  { id: 'e1-2', source: 'start', target: 'pipeline', type: 'straight' },
  { id: 'e2-3', source: 'pipeline', target: 'queryParameters', type: 'straight' },
  { id: 'e3-4', source: 'queryParameters', target: 'thesaurus', type: 'straight' },
  { id: 'e4-5', source: 'thesaurus', target: 'stopWords', type: 'straight' },
  { id: 'e5-6', source: 'stopWords', target: 'filters', type: 'straight' },
  { id: 'e6-7', source: 'filters', target: 'qre', type: 'straight' },
  { id: 'e7-8', source: 'qre', target: 'featuredResults', type: 'straight' },
  { id: 'e8-9', source: 'featuredResults', target: 'rankingWeights', type: 'straight' },
  { id: 'e9-10', source: 'rankingWeights', target: 'mlRecommendations', type: 'straight' },
  { id: 'e10-11', source: 'mlRecommendations', target: 'mlART', type: 'straight' },
  { id: 'e11-12', source: 'mlART', target: 'mlDNE', type: 'straight' },
  { id: 'e12-13', source: 'mlDNE', target: 'queryIndex', type: 'straight' },
  { id: 'e13-14', source: 'queryIndex', target: 'triggers', type: 'straight' },


];

export default elements;
