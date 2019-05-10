const compiler = require('./compiler');

describe('webpack-loader', () => {
  it('is exports a loader', async () => {
    const stats = await compiler('getViewer.graphql');
    const output = stats.toJson().modules[0].source;

    expect(output).toMatchInlineSnapshot(`
      "export default \`query getViewer {
        viewer {
          id
        }
      }\`"
    `);
  });
});
