export function catchAsyncErrors(fn) {
  return async (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch((err) => {
        next(null, err);
      });
    }
  };
}

export function catchErrors(error, req, res) {
  if (error.name === 'CastError') {
    return res.status(400).send({ msg: 'Not Found' });
  }
  if (error.name === 'MongoError' && error.code === 11000) {
    return res.status(400).send({ msg: 'Already used.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).send({ msg: 'Not Found' });
  }
  return res.status(400).send({ error });
}
