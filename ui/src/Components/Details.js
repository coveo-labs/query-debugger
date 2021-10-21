import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Details = (props) => {

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (index) => (event, isExpanded) => {
    setExpanded(isExpanded ? index : false);
  };

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
    <div style={{ height: '280px', margin: '2%' }}>
      <h1 style={{ marginLeft: '2%' }}>Details about the selected feature: </h1>
      {!props.featureData.length && <p style={{ marginLeft: '2%', fontSize: '18px' }}>None selected</p>}
      {props.featureData.length > 0 && props.featureData.map((fData, index) =>
        <>
          <Accordion expanded={expanded === index} onChange={handleChange(index)} style={{ width: '50%', margin: 'auto' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography sx={{ width: '33%', flexShrink: 0, textTransform: 'uppercase' }}>
                {/* {fData.feature} */}
                {selectLabel(fData.feature)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography noWrap sx={{ color: 'text.secondary' }}>Condition Used: {fData.condition ? fData.condition.definition : fData.definition}</Typography>
              <Typography noWrap>
                {fData.detailed.expressions}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </div>
  );
};
export default Details;
