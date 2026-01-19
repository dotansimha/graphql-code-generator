import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Duplicates.ts', () => {
  it('ConfigTypeDefinitions types should be exported', () => {
    const fileContent = readFileSync(join(__dirname, '../src/__generated__/Duplicates.ts'), 'utf-8');

    expect(fileContent).toMatch(/export type ConfigTypeDefinitions_ConfigActionId\s*=/);
    expect(fileContent).toMatch(/export type ConfigTypeDefinitions_ConfigEnum\s*=/);
    expect(fileContent).toMatch(/export type ConfigTypeDefinitions_ConfigIconResource\s*=/);
    expect(fileContent).toMatch(/export type ConfigTypeDefinitions\s*=/);
  });

  it('GetFeedbackData creator union type exports should exist', () => {
    const fileContent = readFileSync(join(__dirname, '../src/__generated__/Duplicates.ts'), 'utf-8');

    expect(fileContent).toMatch(
      /export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator\s*=/
    );
    expect(fileContent).toMatch(
      /export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_EndUser\s*=/
    );
    expect(fileContent).toMatch(
      /export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_OrgMember\s*=/
    );
  });
});
