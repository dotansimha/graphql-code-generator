import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { runClientPresetCodemod } from '../src/codemod.js';

function withTempCopyOfFixture(callback: (fixturePath: string) => void): void {
  const fixtureSource = path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'client-preset-codemod-'));
  const fixturePath = path.join(tempDir, 'component.ts');
  fs.copyFileSync(fixtureSource, fixturePath);

  try {
    callback(fixturePath);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

describe('client-preset > codemod', () => {
  test('replaces gql-tag call expressions with imports from the artifact directory', () => {
    withTempCopyOfFixture(fixturePath => {
      const { changedFiles, skippedCallSites } = runClientPresetCodemod({
        include: fixturePath,
        artifactDirectory: path.dirname(fixturePath),
        gqlTagName: 'gql',
      });

      expect(skippedCallSites).toEqual([]);
      expect(changedFiles).toEqual([fixturePath]);

      const result = fs.readFileSync(fixturePath, 'utf8');
      expect(result).toMatchInlineSnapshot(`
        "/* eslint-disable @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        import gql from 'gql-tag';
        import { ADocument, BDocument, CFragmentDoc } from "./graphql";

        //@ts-ignore
        const A = ADocument;

        //@ts-ignore
        const B = BDocument;

        //@ts-ignore
        const C = CFragmentDoc;
        "
      `);
    });
  });

  test('resolves the import path relative to a different artifact directory', () => {
    withTempCopyOfFixture(fixturePath => {
      const artifactDirectory = path.join(path.dirname(fixturePath), '..', 'gql');
      runClientPresetCodemod({ include: fixturePath, artifactDirectory, gqlTagName: 'gql' });

      const result = fs.readFileSync(fixturePath, 'utf8');
      expect(result).toContain(`from "../gql/graphql"`);
    });
  });

  test('is a no-op the second time it runs on already-codemodded code', () => {
    withTempCopyOfFixture(fixturePath => {
      const artifactDirectory = path.dirname(fixturePath);
      runClientPresetCodemod({ include: fixturePath, artifactDirectory, gqlTagName: 'gql' });
      const firstPass = fs.readFileSync(fixturePath, 'utf8');

      const { changedFiles } = runClientPresetCodemod({
        include: fixturePath,
        artifactDirectory,
        gqlTagName: 'gql',
      });

      expect(changedFiles).toEqual([]);
      expect(fs.readFileSync(fixturePath, 'utf8')).toBe(firstPass);
    });
  });

  test('dryRun does not write to disk', () => {
    withTempCopyOfFixture(fixturePath => {
      const original = fs.readFileSync(fixturePath, 'utf8');
      const { changedFiles } = runClientPresetCodemod({
        include: fixturePath,
        artifactDirectory: path.dirname(fixturePath),
        gqlTagName: 'gql',
        dryRun: true,
      });

      expect(changedFiles).toEqual([fixturePath]);
      expect(fs.readFileSync(fixturePath, 'utf8')).toBe(original);
    });
  });
});
