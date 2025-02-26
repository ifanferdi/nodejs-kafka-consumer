const ScheduleMapping = require("../mappings/schedule-mapping");
const _ = require("lodash");
const { isArray } = require("lodash");
const logger = require("../../../helpers/pino-logger");

module.exports = (client) => {
  const idPrefixGenerator = (id, prefix) => (prefix ? `${prefix}-${id}` : id);

  /**
   * Just create an index without adding documents
   */
  const createIndex = async (index, schema = ScheduleMapping) =>
    await client.indices.create({ index, mappings: schema });

  const checkIndex = async (index) => await client.indices.exists({ index });

  const getById = async (index, id) => {
    return getOnlySourceData(
      await client.get({ index, id }).catch((err) => {
        return err.meta.body;
      })
    );
  };

  const count = async (index) => await client.count({ index });

  /**
   * Delete document in index by id
   */
  const destroy = async (index, id, prefix = null) =>
    await client.delete({ index, id: idPrefixGenerator(id, prefix) }).catch((err) => err?.meta?.body);

  /**
   * Deleting an index
   */
  const destroyIndex = async (index) => await client.indices.delete({ index }).catch((err) => err?.meta?.body?.error);

  /**
   * Create Or Replace document
   */
  const create = async (index, document, prefix = null) => {
    if (!(await checkIndex(index))) await createIndex(index);

    const id = idPrefixGenerator(document.id, prefix);

    return await client.index({ index, id, document });
  };

  /**
   * Update document by id in index
   */
  const update = async (index, id, doc, prefix = null) => {
    id = idPrefixGenerator(id, prefix);

    return await client.update({ index, id, doc });
  };

  /**
   * bulk operations in one action
   * can be multiple operation like create, update, or delete
   * ref: https://www.elastic.co/guide/en/elasticsearch/reference/8.17/docs-bulk.html#docs-bulk-api-example
   */
  const bulk = async (_index, documents, option) => {
    const { prefixId = null, routing = null } = option;

    if (!(await checkIndex(_index))) await createIndex(_index);
    if (!isArray(documents)) documents = [documents];

    const operations = documents.flatMap((doc) => [
      { index: { _index, _id: idPrefixGenerator(doc.id, prefixId) } },
      doc
    ]);

    return await client.bulk({ refresh: true, operations, routing });
  };

  /**
   * ref query: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html
   */
  const search = async (index, params = {}) => {
    const { search, page = 1, limit = 10, queryType = "filter" } = params;
    const { filter = {}, arrayFilter = {}, betweenFilter = {} } = params;
    const { searchSources = [], searchToAuthor = ["name", "username"], sort = ["updatedAt:desc"] } = params;
    const { joinField = "schedule" } = params;

    const searchQuery = [];
    const filterQuery = [];
    const boolQuery = [];

    const from = (page - 1) * limit;

    // note: inner hits harus didalam query has_parent / has_child
    let joinQuery = { match: { my_join_field: joinField } };
    const payload = {
      index,
      size: limit === -1 ? undefined : limit,
      from,
      sort: []
    };

    // sorting data with multiple column
    sort.map((string) => {
      const [sort, sortType] = string.split(":");
      payload.sort.push({ [sort]: sortType });
    });

    // searching data with multiple column & to parent query
    if (search) searchSources.map((column) => searchQuery.push({ wildcard: { [column]: `*${search}*` } }));

    // filter data with multiple column
    if (Object.keys(filter).length > 0)
      Object.keys(filter).forEach((key) => filterQuery.push({ match: { [key]: filter[key] } }));

    // filter data with multiple column using IN query
    if (Object.keys(arrayFilter).length > 0)
      Object.keys(arrayFilter).forEach((key) => filterQuery.push({ terms: { [key]: arrayFilter[key] } }));

    // filter data with multiple column using BETWEEN query
    if (Object.keys(betweenFilter).length > 0)
      Object.keys(betweenFilter).forEach((key) =>
        filterQuery.push({ range: { [key]: { gte: betweenFilter[key][0], lt: betweenFilter[key][1] } } })
      );

    // use search and filter to object query
    if (filterQuery.length > 0 || searchQuery.length > 0) {
      if (filterQuery.length > 0) boolQuery.push(...filterQuery);
      if (searchQuery.length > 0) boolQuery.push({ bool: { must: searchQuery } });
    }

    // use search query to parent relation
    if (search && searchToAuthor.length > 0) {
      const searchToParentQuery = [];
      searchToAuthor.map((column) =>
        searchToParentQuery.push({ wildcard: { [column]: { value: `*${search}*`, case_insensitive: true } } })
      );
      joinQuery = { has_parent: { parent_type: "author", query: { bool: { must: searchToParentQuery } } } };
    }

    // assign all bool query & join author query
    Object.assign(payload, { query: { bool: { [queryType]: [joinQuery, ...boolQuery] } } });

    logger.info(JSON.stringify(payload));
    // running query
    const { hits } = await client.search(payload);
    hits.hits = getOnlySourceData(hits.hits);

    return hits;
  };

  const getOnlySourceData = (hits) =>
    Array.isArray(hits)
      ? hits.map((item) => ({ ..._.omit(item, ["_source", "sort"]), _sort: item?.sort, ...item._source }))
      : {
          ..._.omit(hits, ["_source", "_version", "_seq_no", "_primary_term", "found"]),
          _found: hits.found,
          ...hits._source
        };
  return { createIndex, count, create, bulk, getById, search, update, destroy, destroyIndex };
};
