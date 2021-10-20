import curlconverter from 'curlconverter';
import { PlatformClient, Environment, Region } from '@coveord/platform-client';

import 'isomorphic-fetch'; // dependency of platform-client
import 'abortcontroller-polyfill'; // dependency of platform-client
import fs from 'fs';
import path from 'path';


const INPUT_FILE = path.join('data', 'input.txt');
const fieldsToKeepFromPipeline = ['id', 'name', 'condition', 'statements'];
const fieldsToKeepFromStatements = ['id', 'feature', 'definition', 'condition', 'detailed'];
const scriptTranslators = [
  { from: /not \( (\$\w+) isEmpty \)/gm, to: `($1!="")` },
  { from: /(\$\w+) is not "?(\w+)"?/gm, to: `($1!=="$2")` },
  { from: /(\$\w+) is not "?(\S+)"/gm, to: `($1!=="$2")` },
  { from: /(\$\w+) is "?(\w+)"?/gm, to: `($1=="$2")` },
  { from: /(\$\w+) is "?(\S+)"/gm, to: `($1=="$2")` },
  { from: /(\$\w+) matches "?(\w+)"?/gm, to: `($1=="$2")` },
  { from: /(\$\w+) doesn't match "?(\w+)"?/gm, to: `($1!="$2")` },
  { from: /(\$\w+) matches "?(\S+)"/gm, to: `($1=="$2")` },
  { from: /(\$\w+) doesn't match "?(\S+)"/gm, to: `($1!="$2")` },
  { from: /(\$\w+) isEmpty/gm, to: `($1=="" || $1==undefined)` },
  { from: /(\$\w+) contains "?(\w+)"?/gm, to: `($1.indexOf("$2")!=-1)` },
  { from: /not \( (\$\w+) isPopulated \)/gm, to: `($1==undefined)` },
  { from: /(\$\w+) isPopulated/gm, to: `($1!=undefined)` },
  { from: /not \( (\$\w+) (\[\w+\]) isPopulated \)/gm, to: `($1$2==undefined)` },
  { from: /(\$\w+) ?(\[\w+\]) isPopulated/gm, to: `($1$2!=undefined)` },
  { from: /not \( (\$\w+) ?(\[\w+\]) isEmpty \)/gm, to: `($1$2!="")` },
  { from: /(\$\w+) ?(\[\w+\]) isEmpty/gm, to: `($1$2=="" || $1$2==undefined)` },
  { from: /(\$\w+) ?(\[\w+\]) is not "?(\S+)"?/gm, to: `($1$2!=="$3")` },
  { from: /(\$\w+) ?(\[\w+\]) is "?(\S+)"?/gm, to: `($1$2=="$3")` },
  { from: /(\$\w+) ?(\[\w+\]) matches "?(\S+)"?/gm, to: `($1$2=="$3")` },
  { from: /(\$\w+) ?(\[\w+\]) doesn't match "?(\S+)"?/gm, to: `($1$2!="$3")` },
  { from: /(\$\w+) ?(\[\w+\]) contains "?(\S+)"?/gm, to: `($1$2.indexOf("$3")!=-1)` },
  { from: /(\$\w+) doesn't contain "?(\w+)"?/gm, to: `($1.indexOf("$2")==-1)` },
  { from: /(\$\w+) ?(\[\w+\]) doesn't contain "?(\S+)"?/gm, to: `($1$2.indexOf("$3")==-1)` },
  { from: / and /gm, to: ` && ` },
  { from: / or /gm, to: ` || ` },
]
const addFull = false;


const parseCurl = (curlCmd) => {
  const jsonString = curlconverter.toJsonString(curlCmd);
  const json = JSON.parse(jsonString);
  let results = {};
  results.headers = json.headers;
  results.queries = json.queries;
  results.data = json.data;
  // data is a map of the POST body, as a key.
  // for example: 
  // "data": {
  //   "{\"locale\":\"en-US\",\"debug\":false,\"tab\":\"default\",\"referrer\":\"default\",\"timezone\":\"America/Toronto\",\"visitorId\":\"\",\"fieldsToInclude\":[\"author\",\"language\",\"urihash\",\"objecttype\",\"collection\",\"source\",\"permanentid\",\"cat_attributes\",\"cat_available_size_types\",\"cat_available_sizes\",\"cat_brand\",\"cat_categories\",\"cat_color\",\"cat_color_code\",\"cat_color_swatch\",\"cat_discount\",\"cat_gender\",\"cat_mrp\",\"cat_rating_count\",\"cat_retailer\",\"cat_retailer_category\",\"cat_retailer_categoryh\",\"cat_size\",\"cat_size_type\",\"cat_slug\",\"cat_total_sizes\",\"ec_brand\",\"ec_category\",\"ec_cogs\",\"ec_description\",\"ec_images\",\"ec_in_stock\",\"ec_item_group_id\",\"ec_name\",\"ec_parent_id\",\"ec_price\",\"ec_product_id\",\"ec_promo_price\",\"ec_rating\",\"ec_shortdesc\",\"ec_skus\",\"ec_thumbnails\",\"ec_variant_sku\",\"category\",\"clickUri\",\"sku\",\"title\"],\"pipeline\":\"Search\",\"q\":\"\",\"enableQuerySyntax\":false,\"searchHub\":\"MainSearch\",\"sortCriteria\":\"relevancy\",\"enableDidYouMean\":true,\"facets\":[{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":6,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_color\",\"field\":\"cat_color\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":15,\"sortCriteria\":\"alphanumeric\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size\",\"field\":\"cat_size\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"ec_brand\",\"field\":\"ec_brand\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size_type\",\"field\":\"cat_size_type\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_gender\",\"field\":\"cat_gender\"},{\"delimitingCharacter\":\"|\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"basePath\":[],\"filterByBasePath\":true,\"currentValues\":[],\"preventAutoSelect\":false,\"type\":\"hierarchical\",\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"field\":\"ec_category\",\"facetId\":\"ec_category\"}],\"numberOfResults\":30,\"firstResult\":0,\"facetOptions\":{\"freezeFacetOrder\":false}}": ""
  // }

  /*try {
    const data = Object.keys(json.data)[0];
    console.log(data);
    json.data = JSON.parse(data);
  }
  catch (e) {
    // no-op
    console.warn('Parse error: ', e);
  }*/

  return results;
};

const writeJson = (data, fileName) => {
  fs.writeFileSync(path.join('data', fileName), JSON.stringify(data, null, 2));
};

const cleanDefinition = (definition) => {
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

const cleanScript = (condition) => {
  scriptTranslators.map(script => {
    condition = condition.replace(script.from, script.to);
  });
  console.log(condition);
  return condition;
}

const cleanCondition = (condition) => {
  let clean = {};
  if (condition == undefined) return null;
  Object.keys(condition).map(key => {
    if (fieldsToKeepFromStatements.includes(key)) {
      clean[key] = condition[key];
    }
  });
  clean['definition'] = cleanDefinition(clean['definition']);
  //Check if it is a when operation (a condition)
  if (clean['feature'] == 'when') {
    clean['clean_definition'] = cleanScript(clean['definition'].replace('when ', ''));
  }
  return clean;
}
const cleanFieldsPipeline = (pipeline) => {
  let clean = {};
  Object.keys(pipeline).map(key => {
    if (fieldsToKeepFromPipeline.includes(key)) {
      clean[key] = pipeline[key];
    }
  });
  //Check if condition is defined, if so clean it
  clean['condition'] = cleanCondition(clean['condition']);
  return clean;
}
const cleanFieldsStatement = (statements) => {
  let clean = {};
  let cleanStatements = [];
  statements.map(statement => {
    Object.keys(statement).map(key => {
      if (fieldsToKeepFromStatements.includes(key)) {
        clean[key] = statement[key];
      }
    });
    clean['definition'] = cleanDefinition(clean['definition']);
    //Check if condition is defined, if so clean it
    clean['condition'] = cleanCondition(clean['condition']);

    cleanStatements.push(clean);
  });
  return cleanStatements;
}

const getStatements = async (pipeline) => {
  console.log(`Getting Statements for: ${pipeline.id}`);
  return new Promise((resolve, reject) => {
    platformClient.pipeline.statements.list(pipeline.id, { perPage: 1000 }).then(
      responseStatement => {
        console.log(`Got Statements for: ${pipeline.id}`);
        let allstatements = {};
        allstatements.fullstatements = responseStatement.statements;
        allstatements.statements = cleanFieldsStatement(responseStatement.statements);
        resolve(allstatements);
      }
    );
  });
}

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


const getQPL = async () => {
  let allContent = [];
  let allTasks = [];
  return new Promise((resolve, reject) => {
    platformClient.pipeline.list({ perPage: 1000 }).then(
      async (response) => {
        console.log(response);
        response.map(async (pipeline) => {
          let pipedata = cleanFieldsPipeline(pipeline);
          let task = getStatements(pipeline).then(result => {
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
      errorHandler
    );
  });
}

const createPlatformClient = (request) => {

  let environment = Environment.prod;
  let region = Region.US;

  const endpoint = (request.headers ?.authority || '').toLowerCase();

  if (endpoint.startsWith('platformqa')) environment = Environment.staging;
  else if (endpoint.startsWith('platformdev')) environment = Environment.dev;
  else if (endpoint.startsWith('platformhipaa')) environment = Environment.hipaa;

  if ((/^platform\w*-au/i).test(endpoint)) region = Region.AU;
  else if ((/^platform\w*-eu/i).test(endpoint)) region = Region.EU;

  const bearer = request.headers ?.authorization || '';
  let apiKeyOrToken = bearer.replace(/^Bearer\s+/gi, '').trim();

  // check for an Admin token in 'data/api.key'
  try {
    apiKeyOrToken = fs.readFileSync(path.join('data', 'api.key')).toString().trim();
  }
  catch (e) {
    console.warn('did not find a valid "data/api.key"');
  }
  console.log(request.queries ?.organizationId);
  console.log(apiKeyOrToken);
  return new PlatformClient({
    accessToken: apiKeyOrToken || 'Missing-Token',
    organizationId: request.queries ?.organizationId,
    environment,
    region,
  });
};

const errorHandler = (message, err) => {
  console.warn(message, err);
};

//
// main
//

// read input
const input = fs.readFileSync(INPUT_FILE).toString();
// parse
const request = parseCurl(input);
// write output
writeJson(request, 'request.json');
console.log('Request parsed.');

// Find pipelines and save in data/pipelines.json
const platformClient = createPlatformClient(request);

let allContent = [];
console.log('Getting QPLs');
await getQPL().then(content => {
  console.log(content);
  writeJson(content, 'pipelines.json');
});


console.log('\nDone.\n');
