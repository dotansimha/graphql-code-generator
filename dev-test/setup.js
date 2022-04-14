process.on('unhandledRejection', err => {
  fail(err);
});
