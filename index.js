import curlconverter from 'curlconverter';
import { PlatformClient, Environment, Region } from '@coveord/platform-client';

import 'isomorphic-fetch'; // dependency of platform-client
import 'abortcontroller-polyfill'; // dependency of platform-client
import fs from 'fs';
import path from 'path';


const INPUT_FILE = path.join('data', 'input.txt');


const parseCurl = (curlCmd) => {
  const jsonString = curlconverter.toJsonString(curlCmd);
  const json = JSON.parse(jsonString);

  // data is a map of the POST body, as a key.
  // for example: 
  // "data": {
  //   "{\"locale\":\"en-US\",\"debug\":false,\"tab\":\"default\",\"referrer\":\"default\",\"timezone\":\"America/Toronto\",\"visitorId\":\"\",\"fieldsToInclude\":[\"author\",\"language\",\"urihash\",\"objecttype\",\"collection\",\"source\",\"permanentid\",\"cat_attributes\",\"cat_available_size_types\",\"cat_available_sizes\",\"cat_brand\",\"cat_categories\",\"cat_color\",\"cat_color_code\",\"cat_color_swatch\",\"cat_discount\",\"cat_gender\",\"cat_mrp\",\"cat_rating_count\",\"cat_retailer\",\"cat_retailer_category\",\"cat_retailer_categoryh\",\"cat_size\",\"cat_size_type\",\"cat_slug\",\"cat_total_sizes\",\"ec_brand\",\"ec_category\",\"ec_cogs\",\"ec_description\",\"ec_images\",\"ec_in_stock\",\"ec_item_group_id\",\"ec_name\",\"ec_parent_id\",\"ec_price\",\"ec_product_id\",\"ec_promo_price\",\"ec_rating\",\"ec_shortdesc\",\"ec_skus\",\"ec_thumbnails\",\"ec_variant_sku\",\"category\",\"clickUri\",\"sku\",\"title\"],\"pipeline\":\"Search\",\"q\":\"\",\"enableQuerySyntax\":false,\"searchHub\":\"MainSearch\",\"sortCriteria\":\"relevancy\",\"enableDidYouMean\":true,\"facets\":[{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":6,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_color\",\"field\":\"cat_color\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":15,\"sortCriteria\":\"alphanumeric\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size\",\"field\":\"cat_size\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"ec_brand\",\"field\":\"ec_brand\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size_type\",\"field\":\"cat_size_type\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_gender\",\"field\":\"cat_gender\"},{\"delimitingCharacter\":\"|\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"basePath\":[],\"filterByBasePath\":true,\"currentValues\":[],\"preventAutoSelect\":false,\"type\":\"hierarchical\",\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"field\":\"ec_category\",\"facetId\":\"ec_category\"}],\"numberOfResults\":30,\"firstResult\":0,\"facetOptions\":{\"freezeFacetOrder\":false}}": ""
  // }

  try {
    const data = Object.keys(json.data)[0];
    json.data = JSON.parse(data);
  }
  catch (e) {
    // no-op
    console.warn('Parse error: ', e);
  }

  return json;
};

const writeJson = (data, fileName) => {
  fs.writeFileSync(path.join('data', fileName), JSON.stringify(data, null, 2));
};

const createPlatformClient = (request) => {

  let environment = Environment.prod;
  let region = Region.US;

  const endpoint = (request.headers?.authority || '').toLowerCase();

  if (endpoint.startsWith('platformqa')) environment = Environment.staging;
  else if (endpoint.startsWith('platformdev')) environment = Environment.dev;
  else if (endpoint.startsWith('platformhipaa')) environment = Environment.hipaa;

  if ((/^platform\w*-au/i).test(endpoint)) region = Region.AU;
  else if ((/^platform\w*-eu/i).test(endpoint)) region = Region.EU;

  const bearer = request.headers?.authorization || '';
  let apiKeyOrToken = bearer.replace(/^Bearer\s+/gi, '').trim();

  // check for an Admin token in 'data/api.key'
  try {
    apiKeyOrToken = fs.readFileSync(path.join('data', 'api.key')).toString().trim();
  }
  catch (e) {
    console.warn('did not find a valid "data/api.key"');
  }

  return new PlatformClient({
    accessToken: apiKeyOrToken || 'Missing-Token',
    organizationId: request.queries?.organizationId,
    environment,
    region,
  });
};

const errorHandler = (err) => {
  console.warn(err);
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

// Find pipelines and save in data/pipelines.json
const platformClient = createPlatformClient(request);

platformClient.pipeline.list({ perPage: 1000 }).then(
  response => {
    writeJson(response, 'pipelines.json');
  },
  errorHandler
);

console.log('\nDone.\n');
