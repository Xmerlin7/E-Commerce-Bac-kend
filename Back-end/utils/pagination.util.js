const paginate = async ({
  model,
  page = 1,
  limit = 10,
  filter = {},
  populate = null,
  sort = {}
}) => {
  const skip = (page - 1) * limit;

  let query = model.find(filter).sort(sort);

  if (populate) {
    query = query.populate(populate);
  }

  const data = await query.skip(skip).limit(limit);

  const total = await model.countDocuments(filter);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export default paginate;