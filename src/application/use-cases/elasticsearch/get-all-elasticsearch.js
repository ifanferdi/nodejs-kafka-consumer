const paginate = require("../../../frameworks/helpers/resource-pagination");
const _ = require("lodash");

module.exports = async (repositories, params) => {
  const { elasticsearchRepository } = repositories;

  const { index, page, limit, withAuthor = true } = params;

  // Do validation here

  let { hits, total } = await elasticsearchRepository.search(index, params);

  if (withAuthor) hits = await includeAuthor(hits, _.uniq(_.map(hits, "authorId")));

  return paginate(page, limit, total.value, hits);

  async function includeAuthor(results, authorIds) {
    const { hits } = await elasticsearchRepository.search(index, {
      joinField: "author",
      arrayFilter: { id: authorIds }
    });

    return results.map((result) => ({ ...result, author: _.find(hits, { id: result.authorId }) ?? null }));
  }
};
