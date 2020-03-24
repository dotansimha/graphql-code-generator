import { SelectionSetToObject } from '@graphql-codegen/visitor-plugin-common';

export class PythonSelectionSetToObject extends SelectionSetToObject {
  transformSelectionSet(): string {
    return 'hello';
    // const grouped = this._buildGroupedSelections();

    // return Object.keys(grouped)
    //   .map(typeName => {
    //     const relevant = grouped[typeName].filter(Boolean);

    //     if (relevant.length === 0) {
    //       return null;
    //     } else if (relevant.length === 1) {
    //       return relevant[0];
    //     } else {
    //       return `( ${relevant.join(' & ')} )`;
    //     }
    //   })
    //   .filter(Boolean)
    //   .join(' | ');
  }

  transformFragmentSelectionSetToTypes(
    fragmentName: string,
    fragmentSuffix: string,
    declarationBlockConfig: any
  ): string {
    return 'world';
  }
}
