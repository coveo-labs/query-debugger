import curlconverter from 'curlconverter';
import { PlatformClient, Environment, Region } from '@coveord/platform-client';

import 'isomorphic-fetch'; // dependency of platform-client
import 'abortcontroller-polyfill'; // dependency of platform-client
import fs from 'fs';
import path from 'path';
import Pipelines from './src/Pipelines.js';


const INPUT_FILE = path.join('data', 'input.txt');

const prefix = "dellsandbox_";

const parseCurl = (curlCmd) => {
  const jsonString = curlconverter.toJsonString(curlCmd);
  const json = JSON.parse(jsonString);
  // data is a map of the POST body, as a key.
  // for example: 
  // "data": {
  //   "{\"locale\":\"en-US\",\"debug\":false,\"tab\":\"default\",\"referrer\":\"default\",\"timezone\":\"America/Toronto\",\"visitorId\":\"\",\"fieldsToInclude\":[\"author\",\"language\",\"urihash\",\"objecttype\",\"collection\",\"source\",\"permanentid\",\"cat_attributes\",\"cat_available_size_types\",\"cat_available_sizes\",\"cat_brand\",\"cat_categories\",\"cat_color\",\"cat_color_code\",\"cat_color_swatch\",\"cat_discount\",\"cat_gender\",\"cat_mrp\",\"cat_rating_count\",\"cat_retailer\",\"cat_retailer_category\",\"cat_retailer_categoryh\",\"cat_size\",\"cat_size_type\",\"cat_slug\",\"cat_total_sizes\",\"ec_brand\",\"ec_category\",\"ec_cogs\",\"ec_description\",\"ec_images\",\"ec_in_stock\",\"ec_item_group_id\",\"ec_name\",\"ec_parent_id\",\"ec_price\",\"ec_product_id\",\"ec_promo_price\",\"ec_rating\",\"ec_shortdesc\",\"ec_skus\",\"ec_thumbnails\",\"ec_variant_sku\",\"category\",\"clickUri\",\"sku\",\"title\"],\"pipeline\":\"Search\",\"q\":\"\",\"enableQuerySyntax\":false,\"searchHub\":\"MainSearch\",\"sortCriteria\":\"relevancy\",\"enableDidYouMean\":true,\"facets\":[{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":6,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_color\",\"field\":\"cat_color\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":15,\"sortCriteria\":\"alphanumeric\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size\",\"field\":\"cat_size\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"ec_brand\",\"field\":\"ec_brand\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size_type\",\"field\":\"cat_size_type\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_gender\",\"field\":\"cat_gender\"},{\"delimitingCharacter\":\"|\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"basePath\":[],\"filterByBasePath\":true,\"currentValues\":[],\"preventAutoSelect\":false,\"type\":\"hierarchical\",\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"field\":\"ec_category\",\"facetId\":\"ec_category\"}],\"numberOfResults\":30,\"firstResult\":0,\"facetOptions\":{\"freezeFacetOrder\":false}}": ""
  // }

  try {
    //const data = Object.keys(json.data)[0];
    //console.log(data);
    //json.data = JSON.parse(data);
  }
  catch (e) {
    // no-op
    console.warn('Parse error: ', e);
  }

  return json;
};

const writeJson = (data, fileName) => {
  let json = JSON.stringify(data, null, 2);
  let buff = new Buffer.from(json);
  let base64data = buff.toString('base64');
  fs.writeFileSync(path.join('data', fileName), base64data);
};

const writeJsonPlain = (data, fileName) => {
  let json = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.join('data', fileName), json);
};

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

const sendRequest = async (request) => {
  console.log(request);
  const r = { ...request }; // copy it to put back 'data' as a JSON string
  r.body = JSON.stringify(r.data);
  r.method = 'POST';
  r.raw_url = r.raw_url.replace(/"/gm, '');
  r.raw_url = r.raw_url.replace(/'/gm, '');
  console.log(r.raw_url);
  const response = await fetch(r.raw_url, r);
  const data = await response.json();
  return data;
};


//
// main
//

// read input
const input = fs.readFileSync(INPUT_FILE).toString();
// parse
const request = parseCurl(input);
// write output
writeJson(request, prefix + '_request.json');
writeJsonPlain(request, prefix + '_request_plain.json');
console.log('Request parsed.');

// Find pipelines and save in data/pipelines.json
const platformClient = createPlatformClient(request);

// console.log('Pipelines (list) for org: \x1b[33m%s\x1b[0m', request.queries?.organizationId);
// const pipelines = await platformClient.pipeline.list({ perPage: 1000 }).catch(errorHandler.bind(null, 'Pipelines (list) - \x1b[31m Error - Check the token in data/api.key. \x1b[0m Expired? \n'));
// console.log(`Pipelines (list) - Got ${pipelines.length} pipelines.`);

const pipelines = new Pipelines(platformClient);
console.log('Getting QPLs');
await pipelines.getQPL().then(content => {
  console.log(content);
  writeJson(content, prefix + '_pipelines.json');
  writeJsonPlain(content, prefix + '_pipelines_plain.json');
});


// Run the cURL request with Debug
console.log('Run the request with Debug');
request.data.debug = true;

console.log('execute request');
const response = await sendRequest(request);
writeJson(response, prefix + '_response.json');
console.log('Request saved in \x1b[33m%s\x1b[0m', prefix + '_response.json');

console.log('\nDone.\n');
