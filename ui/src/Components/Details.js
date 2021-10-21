import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Details = (props) => {

  const [expanded, setExpanded] = React.useState(true);

  const handleChange = (index) => (event, isExpanded) => {
    setExpanded(isExpanded ? index : false);
  };

  // const selectLabel = (fData) => {
  //   if (fData.definition) {
  //     return fData.definition;
  //   }
  //   return fData.label;
  // };
  const selectLabel = (label) => {
    switch (label) {
      case 'rankingweight':
        return label = 'Ranking Weight';
      case 'queryParamOverride':
        return label = 'Query Parameters';
      default:
        return label;
    }
  };


  return (
    <div style={{ height: '280px', margin: '2%', marginBottom: '2%' }}>
      <h2 style={{ marginLeft: '2%' }}>Details about the selected feature: </h2>
      {!props.featureData.length && <p style={{ marginLeft: '2%', fontSize: '18px' }}>None selected</p>}
      {props.featureData.length > 0 &&
        <Accordion expanded={expanded} onChange={handleChange('index')} style={{ margin: 'auto' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0, textTransform: 'uppercase' }}>
              {selectLabel(props.featureData[0].feature)}
            </Typography>
          </AccordionSummary>
          {props.featureData.map((fData, index) =>
            <>
              <AccordionDetails>
                <Typography noWrap>{index + 1}) Definition: {fData.definition || 'N/A'}</Typography>
                <Typography noWrap style={{ marginLeft: '1.5%' }} sx={{ color: 'text.secondary' }}>
                  Condition: {fData.condition ? fData.condition.definition : 'None'}
                </Typography>
                <Typography noWrap style={{ marginLeft: '1.5%' }}>
                  Expression: {fData.detailed.expressions || 'N/A'}
                </Typography>
              </AccordionDetails>
            </>
          )}
        </Accordion>
      }

    </div>
  );
};
export default Details;
