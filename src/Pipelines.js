
const fieldsToKeepFromPipeline = ['id', 'name', 'condition', 'statements'];
const fieldsToKeepFromStatements = ['id', 'feature', 'definition', 'condition', 'detailed'];
const scriptTranslators = [
  { from: /not \( (\$\w+) ?\[(\w+)\] isPopulated \)/gm, to: `($1['$2']==undefined)` },
  { from: /(\$\w+) ?\[(\w+)\] isPopulated/gm, to: `($1['$2']!=undefined)` },
  { from: /not \( (\$\w+) ?\[(\w+)\] isEmpty \)/gm, to: `($1['$2']!="")` },
  { from: /(\$\w+) ?\[(\w+)\] isEmpty/gm, to: `($1['$2']=="" || $1['$2']==undefined)` },
  { from: /(\$\w+) ?\[(\w+)\] is not "(.*?)"/gm, to: `($1['$2']!=="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] is "(.*?)"/gm, to: `($1['$2']=="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] matches "(.*?)"/gm, to: `($1['$2']=="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't match "(.*?)"/gm, to: `($1['$2']!="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] contains "(.*?)"?/gm, to: `($1['$2'].indexOf("$3")!=-1)` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't contain "(.*?)"/gm, to: `($1['$2'].indexOf("$3")==-1)` },
  { from: /(\$\w+) ?\[(\w+)\] is not (.*?) /gm, to: `($1['$2']!=="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] is (.*?) /gm, to: `($1['$2']=="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] matches (.*?) /gm, to: `($1['$2']=="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't match (.*?) /gm, to: `($1['$2']!="$3")` },
  { from: /(\$\w+) ?\[(\w+)\] contains (.*?) /gm, to: `($1['$2'].indexOf("$3")!=-1)` },
  { from: /(\$\w+) ?\[(\w+)\] doesn't contain (.*?) /gm, to: `($1['$2'].indexOf("$3")==-1)` },
  { from: /not \( (\$\w+) isEmpty \)/gm, to: `($1!="")` },
  { from: /(\$\w+) is not "(.*?)"/gm, to: `($1!=="$2")` },
  { from: /(\$\w+) is "(.*?)"/gm, to: `($1=="$2")` },
  { from: /(\$\w+) matches "(.*?)"/gm, to: `($1=="$2")` },
  { from: /(\$\w+) doesn't match "(.*?)"/gm, to: `($1!="$2")` },
  { from: /(\$\w+) isEmpty/gm, to: `($1=="" || $1==undefined)` },
  { from: /(\$\w+) contains "(.*?)"/gm, to: `($1.indexOf("$2")!=-1)` },
  { from: /(\$\w+) doesn't contain "(.*?)"/gm, to: `($1.indexOf("$2")==-1)` },

  { from: /(\$\w+) is not (.*?) /gm, to: `($1!=="$2")` },
  { from: /(\$\w+) is (.*?) /gm, to: `($1=="$2")` },
  { from: /(\$\w+) matches (.*?) /gm, to: `($1=="$2")` },
  { from: /(\$\w+) doesn't match (.*?) /gm, to: `($1!="$2")` },
  { from: /(\$\w+) contains (.*?) /gm, to: `($1.indexOf("$2")!=-1)` },
  { from: /(\$\w+) doesn't contain (.*?) /gm, to: `($1.indexOf("$2")==-1)` },

  { from: /not \( (\$\w+) isPopulated \)/gm, to: `($1==undefined)` },
  { from: /(\$\w+) isPopulated/gm, to: `($1!=undefined)` },
  { from: / and /gm, to: ` && ` },
  { from: / or /gm, to: ` || ` }
];
const addFull = false;


function sleeper(ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

function executeSequentially(tasks) {
  return tasks.reduce(function (sequence, curPromise) {
    // Use reduce to chain the promises together
    return sequence.then(sleeper(50)).then(function () {
      return curPromise;
    });
  }, Promise.resolve());
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
    scriptTranslators.map(script => {
      condition = condition.replace(script.from, script.to);
    });
    console.log(condition);
    return condition;
  }

  cleanCondition(condition) {
    let clean = {};
    if (condition == undefined) return null;
    Object.keys(condition).map(key => {
      if (fieldsToKeepFromStatements.includes(key)) {
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
      if (fieldsToKeepFromPipeline.includes(key)) {
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
        if (fieldsToKeepFromStatements.includes(key)) {
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
    let allTasks = [];
    return new Promise((resolve, reject) => {
      this.platformClient.pipeline.list({ perPage: 1000 }).then(
        async (response) => {
          console.log(response);
          response.map(async (pipeline) => {
            let pipedata = this.cleanFieldsPipeline(pipeline);
            let task = this.getStatements(pipeline).then(result => {
              pipedata['statements'] = result.statements;
              if (addFull) pipedata['fullstatements'] = result.fullstatements;
              allContent.push(pipedata);
              console.log("Got Statements");
            });
            allTasks.push(task);
          });
          console.log("Got ALL Statements");
          executeSequentially(allTasks).then(() => {
            console.log(allContent);
            resolve(allContent);
          });
        },
        errorHandler.bind(null, 'Pipelines::getQPL - \x1b[31m Error - Check the token in data/api.key. \x1b[0m Expired? \n')
      );
    });
  }

  async getStatements(pipeline) {
    console.log(`Getting Statements for: ${pipeline.id}`);
    return new Promise((resolve, reject) => {
      this.platformClient.pipeline.statements.list(pipeline.id, { perPage: 1000 }).then(
        responseStatement => {
          console.log(`Got Statements for: ${pipeline.id}`);
          let allstatements = {};
          allstatements.fullstatements = responseStatement.statements;
          allstatements.statements = this.cleanFieldsStatement(responseStatement.statements);
          resolve(allstatements);
        }
      );
    });
  }

}


export default Pipelines;
