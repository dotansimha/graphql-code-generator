module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: process.versions.node.split('.')[0] } }],
    ['@babel/preset-typescript', { allowDeclareFields: true }],
  ],
};
