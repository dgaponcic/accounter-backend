function catchAsyncErrors(fn) {
  return async (req, res, next) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
      routePromise.catch((err) => {
        next(null, err);
      });
    }
  };
}

export default catchAsyncErrors;
