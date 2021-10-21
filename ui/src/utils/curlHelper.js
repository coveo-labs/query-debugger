import * as curlconverter from 'curlconverter';

const curlHelper = {
  parseCurl: (curlCmd) => {
    const jsonString = curlconverter.toJsonString(curlCmd);
    const json = JSON.parse(jsonString);
    // data is a map of the POST body, as a key.
    // for example: 
    // "data": {
    //   "{\"locale\":\"en-US\",\"debug\":false,\"tab\":\"default\",\"referrer\":\"default\",\"timezone\":\"America/Toronto\",\"visitorId\":\"\",\"fieldsToInclude\":[\"author\",\"language\",\"urihash\",\"objecttype\",\"collection\",\"source\",\"permanentid\",\"cat_attributes\",\"cat_available_size_types\",\"cat_available_sizes\",\"cat_brand\",\"cat_categories\",\"cat_color\",\"cat_color_code\",\"cat_color_swatch\",\"cat_discount\",\"cat_gender\",\"cat_mrp\",\"cat_rating_count\",\"cat_retailer\",\"cat_retailer_category\",\"cat_retailer_categoryh\",\"cat_size\",\"cat_size_type\",\"cat_slug\",\"cat_total_sizes\",\"ec_brand\",\"ec_category\",\"ec_cogs\",\"ec_description\",\"ec_images\",\"ec_in_stock\",\"ec_item_group_id\",\"ec_name\",\"ec_parent_id\",\"ec_price\",\"ec_product_id\",\"ec_promo_price\",\"ec_rating\",\"ec_shortdesc\",\"ec_skus\",\"ec_thumbnails\",\"ec_variant_sku\",\"category\",\"clickUri\",\"sku\",\"title\"],\"pipeline\":\"Search\",\"q\":\"\",\"enableQuerySyntax\":false,\"searchHub\":\"MainSearch\",\"sortCriteria\":\"relevancy\",\"enableDidYouMean\":true,\"facets\":[{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":6,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_color\",\"field\":\"cat_color\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":15,\"sortCriteria\":\"alphanumeric\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size\",\"field\":\"cat_size\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"ec_brand\",\"field\":\"ec_brand\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_size_type\",\"field\":\"cat_size_type\"},{\"delimitingCharacter\":\">\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"type\":\"specific\",\"currentValues\":[],\"freezeCurrentValues\":false,\"isFieldExpanded\":false,\"preventAutoSelect\":false,\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"facetId\":\"cat_gender\",\"field\":\"cat_gender\"},{\"delimitingCharacter\":\"|\",\"filterFacetCount\":true,\"injectionDepth\":1000,\"numberOfValues\":5,\"sortCriteria\":\"occurrences\",\"basePath\":[],\"filterByBasePath\":true,\"currentValues\":[],\"preventAutoSelect\":false,\"type\":\"hierarchical\",\"facetSearch\":{\"captions\":{},\"numberOfValues\":10,\"query\":\"\"},\"field\":\"ec_category\",\"facetId\":\"ec_category\"}],\"numberOfResults\":30,\"firstResult\":0,\"facetOptions\":{\"freezeFacetOrder\":false}}": ""
    // }

    try {
      const data = Object.keys(json.data)[0];
      console.log(data);
      json.data = JSON.parse(data);
    }
    catch (e) {
      // no-op
      console.warn('Parse error: ', e);
    }

    return json;
  },

  sendRequest: async (request) => {
    const r = { ...request }; // copy it to put back 'data' as a JSON string
    r.body = JSON.stringify(r.data);
    r.mode = 'no-cors';
    const response = await fetch(r.raw_url, r);
    const data = await response.json();
    return data;
  },
};

export default curlHelper;
