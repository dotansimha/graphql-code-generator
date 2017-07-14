import { cleanTemplateComments } from '../src/clean-template';

describe('cleanTemplateComments', () => {
  it('should clean comments from simple one line string with one magic comment', () => {
    const str = `/*gqlgen {{#each test }} */`;
    const result = cleanTemplateComments(str);
    expect(result).toBe('{{#each test }}');
  });

  it('should clean comments from simple multiple line string with multiple uses of magic comments', () => {
    const str = `
    class MyComp extends React.Component {
      render() {
        return (
          <ul>
            /*gqlgen {{#each items }} */
              <li>/*gqlgen{{ test }}*/</li>
            /*gqlgen {{/each}} */
          </ul>
        );
      }
    }`;
    const result = cleanTemplateComments(str);
    expect(result).toBe(`
    class MyComp extends React.Component {
      render() {
        return (
          <ul>
            {{#each items }}
              <li>{{ test }}</li>
            {{/each}}
          </ul>
        );
      }
    }`);
  });
});
