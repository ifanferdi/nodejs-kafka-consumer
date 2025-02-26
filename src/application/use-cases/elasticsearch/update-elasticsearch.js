module.exports = async (repositories, index, prefix, payload) => {
  const { elasticsearchRepository } = repositories;
  return await elasticsearchRepository.update(index, payload.id, payload, prefix);
};
