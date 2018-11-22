const request = jest.genMockFromModule('request');

let mocks = {};
let calls = {};

module.exports = {
  ...request,
  __resetMocks: () => {
    mocks = {};
    calls = {};
  },
  __registerUrlRequestMock: (url, content) => {
    mocks[url] = content;
  },
  __getCalls: url => {
    return calls[url] || [];
  },
  post: (options, cb) => {
    if (!calls[options.url]) {
      calls[options.url] = [];
    }

    calls[options.url].push(options);

    if (mocks[options.url]) {
      return cb(null, {}, { data: mocks[options.url] });
    } else {
      return cb(new Error('Invalid request'), {}, null);
    }
  }
};
