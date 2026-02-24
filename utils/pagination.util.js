const paginate = async (Model, page, limit, filter = {}) => {
  const skip = (page - 1) * limit;
  const total = await Model.countDocuments(filter);
  const filteredModel = Model.find(filter).skip(skip).limit(limit);

  return {
    total,
    filteredModel,
  };
};
export default paginate
