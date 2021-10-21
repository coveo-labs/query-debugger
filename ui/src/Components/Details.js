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

  const selectLabel = (fData) => {
    if (fData.definition) {
      return fData.definition;
    }
    return fData.label;
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
              <Typography sx={{ width: '90%', flexShrink: 0, textTransform: 'uppercase' }}>
                {/* {fData.feature} */}
                {selectLabel(fData)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {fData.condition?.definition && <Typography noWrap sx={{ color: 'text.secondary' }}>Condition Used: {fData.condition.definition}</Typography>}
              {fData.detailed.expressions && <Typography noWrap>{fData.detailed.expressions}</Typography>}
              <Typography noWrap>{fData.feature} {fData.id}</Typography>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </div>
  );
};
export default Details;
