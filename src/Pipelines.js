
const FIELDS_FROM_PIPELINE = ['id', 'name', 'condition', 'statements'];
const FIELDS_FROM_STATEMENTS = ['id', 'feature', 'definition', 'condition', 'detailed'];

const SCRIPT_TRANSLATORS = [
  { from: /(\$\w+) ?\[(\w+)\] is true/gm, to: `($1['$2']==true)` },
  { from: /(\$\w+) ?\[(\w+)\] is false/gm, to: `($1['$2']==false)` },//`($1['$2']=="$3")` }, 
  { from: /(\$\w+) is true /gm, to: `($1==true)` },
  { from: /(\$\w+) is false/gm, to: `($1==false)` },
  { from: /(\$\w+) ?\[(\w+)\] is not true/gm, to: `($1['$2']!=true)` },
  { from: /(\$\w+) ?\[(\w+)\] is not false/gm, to: `($1['$2']!=false)` },//`($1['$2']=="$3")` }, 
  { from: /(\$\w+) is not true /gm, to: `($1!=true)` },
  { from: /(\$\w+) is not false/gm, to: `($1!=false)` },
  { from: /not \( (\$\w+) ?\[(\w+)\] isPopulated \)/gm, to: `($1['$2']==undefined)` },
  { from: /(\$\w+) ?\[(\w+)\] isPopulated/gm, to: `($1['$2']!=undefined)` },
  { from: /not \( (\$\w+) ?\[(\w+)\] isEmpty \)/gm, to: `($1['$2']!="")` },
  { from: /(\$\w+) ?\[(\w+)\] isEmpty/gm, to: `($1['$2']=="" || $1['$2']==undefined)` },
  { from: /(\$\w+) ?\[(\w+)\] is not "(.*?)"/gm, to: `(!/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] is "(.*?)"/gm, to: `(/^$3$/.test($1['$2']))` },//`($1['$2']=="$3")` }, 
  { from: /(\$\w+) ?\[(\w+)\] matches "(.*?)"/gm, to: `(/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't match "(.*?)"/gm, to: `(!/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] contains "(.*?)"?/gm, to: `(/$3/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't contain "(.*?)"/gm, to: `(!/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] is not (.*?) /gm, to: `(!/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] is (.*?) /gm, to: `(/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] matches (.*?) /gm, to: `(/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't match (.*?) /gm, to: `(!/^$3$/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] contains (.*?) /gm, to: `(/$3/.test($1['$2']))` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't contain (.*?) /gm, to: `(!/$3/.test($1['$2']))` },
  { from: /not \( (\$\w+) isEmpty \)/gm, to: `($1!="")` },
  { from: /(\$\w+) is not "(.*?)"/gm, to: `(!/^$2$/.test($1))` },
  { from: /(\$\w+) is "(.*?)"/gm, to: `(/^$2$/.test($1))` },
  { from: /(\$\w+) matches "(.*?)"/gm, to: `(/^$2$/.test($1))` },
  { from: /(\$\w+) doesn't match "(.*?)"/gm, to: `(!/^$2$/.test($1))` },
  { from: /(\$\w+) isEmpty/gm, to: `($1=="" || $1==undefined)` },
  { from: /(\$\w+) contains "(.*?)"/gm, to: `(/$2/.test($1))` },
  { from: /(\$\w+) doesn't contain "(.*?)"/gm, to: `(!/$2/.test($1))` },

  { from: /(\$\w+) is not (.*?) /gm, to: `(!/^$2$/.test($1))` },
  { from: /(\$\w+) is (.*?) /gm, to: `(/^$2$/.test($1))` },
  { from: /(\$\w+) matches (.*?) /gm, to: `(/^$2$/.test($1))` },
  { from: /(\$\w+) doesn't match (.*?) /gm, to: `(!/^$2$/.test($1))` },
  { from: /(\$\w+) contains (.*?) /gm, to: `(/$2/.test($1))` },
  { from: /(\$\w+) doesn't contain (.*?) /gm, to: `(!/$2/.test($1))` },

  { from: /not \( (\$\w+) isPopulated \)/gm, to: `($1==undefined)` },
  { from: /(\$\w+) isPopulated/gm, to: `($1!=undefined)` },
  { from: / and /gm, to: ` && ` },
  { from: / or /gm, to: ` || ` },
];
const addFull = false;


async function sleeper(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const errorHandler = (message, err) => {
  console.warn(message, err);
};


class Pipelines {
  constructor(platformClient) {
    this.platformClient = platformClient;
  }

  cleanDefinition(definition) {
    //\"(.*)\", --> replace to (.*)
    //\"(.*)\" --> replace to (.*)
    //let regex1 = /\\"(.*)\\",/gm;
    //let regex2 = /\\"(.*)\\"/gm;
    let regex1 = /"(\w+)"/gm;
    let regex2 = /"\\"(.*)\\""/gm;
    //console.log('Before clean: ' + definition);
    let clean = definition.replace(regex1, "$1").replace(regex2, '"$1"');
    //console.log('After clean: ' + clean);
    return clean;
  }

  cleanScript(condition) {
    condition = condition + ' ';
    SCRIPT_TRANSLATORS.map(script => {
      condition = condition.replace(script.from, script.to);
    });
    console.log(condition);
    return condition;
  }

  cleanCondition(condition) {
    let clean = {};
    if (!condition) { return null; }
    Object.keys(condition).map(key => {
      if (FIELDS_FROM_STATEMENTS.includes(key)) {
        clean[key] = condition[key];
      }
    });
    clean['definition'] = this.cleanDefinition(clean['definition']);
    //Check if it is a when operation (a condition)
    if (clean['feature'] == 'when') {
      clean['clean_definition'] = this.cleanScript(clean['definition'].replace('when ', ''));
    }
    return clean;
  }

  cleanFieldsPipeline(pipeline) {
    let clean = {};
    Object.keys(pipeline).map(key => {
      if (FIELDS_FROM_PIPELINE.includes(key)) {
        clean[key] = pipeline[key];
      }
    });

    //Check if condition is defined, if so clean it
    clean['condition'] = this.cleanCondition(clean['condition']);
    return clean;
  }

  cleanFieldsStatement(statements) {
    let clean = {};
    let cleanStatements = [];
    statements.map(statement => {
      Object.keys(statement).map(key => {
        if (FIELDS_FROM_STATEMENTS.includes(key)) {
          clean[key] = statement[key];
        }
      });
      clean['definition'] = this.cleanDefinition(clean['definition']);
      //Check if condition is defined, if so clean it
      clean['condition'] = this.cleanCondition(clean['condition']);

      cleanStatements.push(clean);
    });
    return cleanStatements;
  }

  async getQPL() {
    let allContent = [];

    const response = await this.platformClient.pipeline.list({ perPage: 1000 }).catch(errorHandler.bind(null, 'Pipelines::getQPL - \x1b[31m Error - Check the token in data/api.key. \x1b[0m Expired? \n'));
    // console.log(response);

    // use for loop instead of response.forEach or response.map to ensure it's sequential.
    for (let i = 0; i < response.length; i++) {
      const pipeline = response[i];
      let pipedata = this.cleanFieldsPipeline(pipeline);
      let result = await this.getStatements(pipeline);

      pipedata['statements'] = result.statements;
      if (addFull) {
        pipedata['fullstatements'] = result.fullstatements;
      }
      allContent.push(pipedata);
      console.log("");
      await sleeper(100);
    }
    console.log("Got ALL Statements");

    return allContent;
  }

  async getStatements(pipeline) {
    console.log(`Getting Statements for: ${pipeline.id}`);
    const responseStatement = await this.platformClient.pipeline.statements.list(pipeline.id, { perPage: 1000 });
    console.log(`Got Statements for: ${pipeline.id}`);

    let allstatements = {
      fullstatements: responseStatement.statements,
      statements: this.cleanFieldsStatement(responseStatement.statements),
    };

    return allstatements;
  }

}


export default Pipelines;
