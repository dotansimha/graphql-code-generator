const handlebars: any = jest.genMockFromModule('handlebars');

let helpers = Object.create(null);

function __getHelpers() {
  return helpers;
}

handlebars.__getHelpers = __getHelpers;

handlebars.registerHelper = (helperName, helperFn) => {
  helpers[helperName] = helperFn;
};

module.exports = handlebars;