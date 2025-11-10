import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin as tsPlugin } from '../../typescript/src/index.js';
import { plugin, TypeScriptDocumentsPluginConfig } from '../src/index.js';

describe('extractAllFieldsToTypes: true', () => {
  const validate = async (content: Types.PluginOutput, config: any = {}, pluginSchema) => {
    const m = mergeOutputs([await tsPlugin(pluginSchema, [], config, { outputFile: '' }), content]);
    validateTs(m, undefined, undefined, undefined, []);

    return m;
  };

  const dummyUserTestSchema = buildSchema(/* GraphQL */ `
    scalar Date
    type Query {
      me: User
    }
    interface User {
      id: ID!
      joinDate: Date!
    }
    type DummyUser implements User {
      id: ID!
      joinDate: Date!
    }
    type ActiveUser implements User {
      id: ID!
      joinDate: Date!
      isActive: Boolean!
      parentUser: User!
      thing: String!
    }
  `);

  const dummyUserDoc = parse(/* GraphQL */ `
    fragment UserFragment on User {
      id
      joinDate
    }
    fragment Me on User {
      id
      ...UserFragment
      ... on ActiveUser {
        isActive
        parentUser {
          ...UserFragment
        }
      }
    }
    query OverlappingFieldsMergingTest {
      # this should be optimized to be: me { ...Me } since they're both selecting for 'id'
      me {
        id
        ...Me
      }
    }
    query NestedOverlappingFieldsMergingTest {
      # an optimization here would be for these to merge,
      # since ParentMe selects for the same things as the field selection in: me { id }
      me {
        ...Me
        ... on ActiveUser {
          isActive
        }
      }
    }
  `);

  it('should extract types from queries', async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      preResolveTypes: true,
      extractAllFieldsToTypes: true,
      printFieldsOnNewLines: true,
      nonOptionalTypename: true,
      dedupeOperationSuffix: true,
    };
    const { content } = await plugin(
      dummyUserTestSchema,
      [{ location: 'test-file.ts', document: dummyUserDoc }],
      config,
      { outputFile: '' }
    );
    expect(content).toMatchInlineSnapshot(`
      "type UserFragment_DummyUser = {
        __typename: 'DummyUser',
        id: string,
        joinDate: any
      };

      type UserFragment_ActiveUser = {
        __typename: 'ActiveUser',
        id: string,
        joinDate: any
      };

      export type UserFragment =
        | UserFragment_DummyUser
        | UserFragment_ActiveUser
      ;

      export type MeFragment_ActiveUser_parentUser_DummyUser = {
        __typename: 'DummyUser',
        id: string,
        joinDate: any
      };

      export type MeFragment_ActiveUser_parentUser_ActiveUser = {
        __typename: 'ActiveUser',
        id: string,
        joinDate: any
      };

      export type MeFragment_ActiveUser_parentUser =
        | MeFragment_ActiveUser_parentUser_DummyUser
        | MeFragment_ActiveUser_parentUser_ActiveUser
      ;

      type Me_DummyUser_Fragment = {
        __typename: 'DummyUser',
        id: string,
        joinDate: any
      };

      type Me_ActiveUser_Fragment = {
        __typename: 'ActiveUser',
        isActive: boolean,
        id: string,
        joinDate: any,
        parentUser: MeFragment_ActiveUser_parentUser
      };

      export type MeFragment =
        | Me_DummyUser_Fragment
        | Me_ActiveUser_Fragment
      ;

      export type OverlappingFieldsMergingTestQuery_me_DummyUser = {
        __typename: 'DummyUser',
        id: string,
        joinDate: any
      };

      export type OverlappingFieldsMergingTestQuery_me_ActiveUser = {
        __typename: 'ActiveUser',
        id: string,
        isActive: boolean,
        joinDate: any,
        parentUser: MeFragment_ActiveUser_parentUser
      };

      export type OverlappingFieldsMergingTestQuery_me =
        | OverlappingFieldsMergingTestQuery_me_DummyUser
        | OverlappingFieldsMergingTestQuery_me_ActiveUser
      ;

      export type OverlappingFieldsMergingTestQuery_Query = {
        __typename: 'Query',
        me?: OverlappingFieldsMergingTestQuery_me | null
      };


      export type OverlappingFieldsMergingTestQueryVariables = Exact<{ [key: string]: never; }>;


      export type OverlappingFieldsMergingTestQuery = OverlappingFieldsMergingTestQuery_Query;

      export type NestedOverlappingFieldsMergingTestQuery_me_DummyUser = {
        __typename: 'DummyUser',
        id: string,
        joinDate: any
      };

      export type NestedOverlappingFieldsMergingTestQuery_me_ActiveUser = {
        __typename: 'ActiveUser',
        isActive: boolean,
        id: string,
        joinDate: any,
        parentUser: MeFragment_ActiveUser_parentUser
      };

      export type NestedOverlappingFieldsMergingTestQuery_me =
        | NestedOverlappingFieldsMergingTestQuery_me_DummyUser
        | NestedOverlappingFieldsMergingTestQuery_me_ActiveUser
      ;

      export type NestedOverlappingFieldsMergingTestQuery_Query = {
        __typename: 'Query',
        me?: NestedOverlappingFieldsMergingTestQuery_me | null
      };


      export type NestedOverlappingFieldsMergingTestQueryVariables = Exact<{ [key: string]: never; }>;


      export type NestedOverlappingFieldsMergingTestQuery = NestedOverlappingFieldsMergingTestQuery_Query;
      "
    `);

    await validate(content, config, dummyUserTestSchema);
  });

  const complexTestSchemaWithUnionsAndInterfaces = buildSchema(/* GraphQL */ `
    interface GenericCallSummary {
      id: ID!
      timestamp: String!
      summary: String!
      isTrusted: Boolean!
    }

    type CallerID {
      phone: String!
      formattedPhone: String!
      name: String
    }

    enum CallType {
      OUTGOING
      INCOMING
      VOICEMAIL
      UNKNOWN
    }

    type TalkInteraction {
      channel: String!
      rel: String

      type: CallType!

      from: CallerID
      to: CallerID
    }

    interface ConnectionNode {
      id: ID!
    }

    interface ConversationEvent implements ConnectionNode {
      id: ID!
      timestamp: String!
      originatedFrom: OriginatedFrom!
    }

    type BrokenConversationEvent implements ConversationEvent & ConnectionNode {
      id: ID!
      timestamp: String!

      originatedFrom: OriginatedFrom!
      extraField: String!
    }

    union OriginatedFrom =
        EmailInteraction
      | CustomChannelInteraction
      | TalkInteraction
      | NativeMessagingInteraction
      | WhatsAppInteraction
      | WeChatInteraction
      | NotImplementedOriginatedFrom

    type NotImplementedOriginatedFrom {
      channel: String
      rel: String
    }

    type EmailInteraction {
      originalEmailURLPath: String!
    }

    interface ChannelInteraction {
      externalId: String!
      timestamp: String!
      resourceType: String!
      version: Int!
    }

    type CustomChannelInteraction implements ChannelInteraction {
      externalId: String!
      timestamp: String!
      resourceType: String!
      version: Int!
    }

    interface BrandedConversation {
      conversationId: ID
    }

    type NativeMessagingInteraction implements BrandedConversation {
      conversationId: ID
    }

    type WhatsAppInteraction implements BrandedConversation {
      conversationId: ID
    }

    type WeChatInteraction implements BrandedConversation {
      conversationId: ID
    }

    type ArchivedArticle {
      id: ID!
      title: String!
      url: String!
      htmlUrl: String!
    }

    type BotSolution implements ConnectionNode & ConversationEvent {
      id: ID!
      timestamp: String!
      originatedFrom: OriginatedFrom!

      article: ArchivedArticle!
    }

    type TalkPublicCallSummary implements ConnectionNode & ConversationEvent & GenericCallSummary {
      id: ID!
      timestamp: String!
      summary: String!
      isTrusted: Boolean!
      originatedFrom: OriginatedFrom!
    }
  `);

  const fragmentsOnComplexSchema = parse(/* GraphQL */ `
    fragment ConversationBotSolution on BotSolution {
      id
      ...ConversationConversationEvent
      article {
        id
        htmlUrl
        title
        url
      }
      originatedFrom {
        ...ConversationOriginatedFrom
      }
    }

    fragment ConversationGenericCallSummary on GenericCallSummary {
      id
      summary
    }
    fragment ConversationTalkInteraction on TalkInteraction {
      channel
      type
    }
    fragment ConversationConversationEvent on ConversationEvent {
      __typename
      id
      timestamp
      originatedFrom {
        ...ConversationOriginatedFrom
      }
    }

    fragment MessageEnvelopeData on OriginatedFrom {
      ... on EmailInteraction {
        originalEmailURLPath
      }
    }

    fragment AnyChannelOriginatedFrom on CustomChannelInteraction {
      externalId
      timestamp
      resourceType
    }

    fragment ConversationOriginatedFrom on OriginatedFrom {
      __typename
      ... on BrandedConversation {
        conversationId
      }
      ...MessageEnvelopeData
      ...AnyChannelOriginatedFrom
    }

    fragment ConversationTalkPublicCallSummary on TalkPublicCallSummary {
      id
      ...ConversationConversationEvent
      ...ConversationGenericCallSummary
      originatedFrom {
        ... on TalkInteraction {
          ...ConversationTalkInteraction
        }
      }
    }
  `);

  it('should extract types from multiple fragments', async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      preResolveTypes: true,
      extractAllFieldsToTypes: true,
      nonOptionalTypename: true,
      dedupeOperationSuffix: true,
    };
    const { content } = await plugin(
      complexTestSchemaWithUnionsAndInterfaces,
      [{ location: 'test-file.ts', document: fragmentsOnComplexSchema }],
      config,
      { outputFile: '' }
    );
    expect(content).toMatchInlineSnapshot(`
      "export type ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle = { __typename: 'ArchivedArticle', id: string, htmlUrl: string, title: string, url: string };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction = { __typename: 'EmailInteraction', originalEmailURLPath: string };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction = { __typename: 'CustomChannelInteraction', externalId: string, timestamp: string, resourceType: string };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction = { __typename: 'TalkInteraction' };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction = { __typename: 'NativeMessagingInteraction', conversationId?: string | null };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction = { __typename: 'WhatsAppInteraction', conversationId?: string | null };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction = { __typename: 'WeChatInteraction', conversationId?: string | null };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom =
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationBotSolutionFragment = { __typename: 'BotSolution', id: string, timestamp: string, article: ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle, originatedFrom: ConversationBotSolutionFragment_BotSolution_originatedFrom };

      export type ConversationGenericCallSummaryFragment = { __typename: 'TalkPublicCallSummary', id: string, summary: string };

      export type ConversationTalkInteractionFragment = { __typename: 'TalkInteraction', channel: string, type: CallType };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction = { __typename: 'EmailInteraction', originalEmailURLPath: string };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction = { __typename: 'CustomChannelInteraction', externalId: string, timestamp: string, resourceType: string };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction = { __typename: 'TalkInteraction' };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction = { __typename: 'NativeMessagingInteraction', conversationId?: string | null };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction = { __typename: 'WhatsAppInteraction', conversationId?: string | null };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction = { __typename: 'WeChatInteraction', conversationId?: string | null };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom =
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom
      ;

      type ConversationConversationEvent_BrokenConversationEvent_Fragment = { __typename: 'BrokenConversationEvent', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom };

      type ConversationConversationEvent_BotSolution_Fragment = { __typename: 'BotSolution', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom };

      type ConversationConversationEvent_TalkPublicCallSummary_Fragment = { __typename: 'TalkPublicCallSummary', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom };

      export type ConversationConversationEventFragment =
        | ConversationConversationEvent_BrokenConversationEvent_Fragment
        | ConversationConversationEvent_BotSolution_Fragment
        | ConversationConversationEvent_TalkPublicCallSummary_Fragment
      ;

      type MessageEnvelopeData_EmailInteraction_Fragment = { __typename: 'EmailInteraction', originalEmailURLPath: string };

      type MessageEnvelopeData_CustomChannelInteraction_Fragment = { __typename: 'CustomChannelInteraction' };

      type MessageEnvelopeData_TalkInteraction_Fragment = { __typename: 'TalkInteraction' };

      type MessageEnvelopeData_NativeMessagingInteraction_Fragment = { __typename: 'NativeMessagingInteraction' };

      type MessageEnvelopeData_WhatsAppInteraction_Fragment = { __typename: 'WhatsAppInteraction' };

      type MessageEnvelopeData_WeChatInteraction_Fragment = { __typename: 'WeChatInteraction' };

      type MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment = { __typename: 'NotImplementedOriginatedFrom' };

      export type MessageEnvelopeDataFragment =
        | MessageEnvelopeData_EmailInteraction_Fragment
        | MessageEnvelopeData_CustomChannelInteraction_Fragment
        | MessageEnvelopeData_TalkInteraction_Fragment
        | MessageEnvelopeData_NativeMessagingInteraction_Fragment
        | MessageEnvelopeData_WhatsAppInteraction_Fragment
        | MessageEnvelopeData_WeChatInteraction_Fragment
        | MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment
      ;

      export type AnyChannelOriginatedFromFragment = { __typename: 'CustomChannelInteraction', externalId: string, timestamp: string, resourceType: string };

      type ConversationOriginatedFrom_EmailInteraction_Fragment = { __typename: 'EmailInteraction', originalEmailURLPath: string };

      type ConversationOriginatedFrom_CustomChannelInteraction_Fragment = { __typename: 'CustomChannelInteraction', externalId: string, timestamp: string, resourceType: string };

      type ConversationOriginatedFrom_TalkInteraction_Fragment = { __typename: 'TalkInteraction' };

      type ConversationOriginatedFrom_NativeMessagingInteraction_Fragment = { __typename: 'NativeMessagingInteraction', conversationId?: string | null };

      type ConversationOriginatedFrom_WhatsAppInteraction_Fragment = { __typename: 'WhatsAppInteraction', conversationId?: string | null };

      type ConversationOriginatedFrom_WeChatInteraction_Fragment = { __typename: 'WeChatInteraction', conversationId?: string | null };

      type ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationOriginatedFromFragment =
        | ConversationOriginatedFrom_EmailInteraction_Fragment
        | ConversationOriginatedFrom_CustomChannelInteraction_Fragment
        | ConversationOriginatedFrom_TalkInteraction_Fragment
        | ConversationOriginatedFrom_NativeMessagingInteraction_Fragment
        | ConversationOriginatedFrom_WhatsAppInteraction_Fragment
        | ConversationOriginatedFrom_WeChatInteraction_Fragment
        | ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment
      ;

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction = { __typename: 'EmailInteraction', originalEmailURLPath: string };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction = { __typename: 'CustomChannelInteraction', externalId: string, timestamp: string, resourceType: string };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction = { __typename: 'TalkInteraction', channel: string, type: CallType };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction = { __typename: 'NativeMessagingInteraction', conversationId?: string | null };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction = { __typename: 'WhatsAppInteraction', conversationId?: string | null };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction = { __typename: 'WeChatInteraction', conversationId?: string | null };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom =
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationTalkPublicCallSummaryFragment = { __typename: 'TalkPublicCallSummary', id: string, timestamp: string, summary: string, originatedFrom: ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom };
      "
    `);

    await validate(content, config, complexTestSchemaWithUnionsAndInterfaces);
  });

  it('should extract types from multiple fragments (mergeFragmentTypes: true)', async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      preResolveTypes: true,
      extractAllFieldsToTypes: true,
      nonOptionalTypename: true,
      dedupeOperationSuffix: true,
      mergeFragmentTypes: true,
    };
    const { content } = await plugin(
      complexTestSchemaWithUnionsAndInterfaces,
      [{ location: 'test-file.ts', document: fragmentsOnComplexSchema }],
      config,
      { outputFile: '' }
    );
    expect(content).toMatchInlineSnapshot(`
      "export type ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle = (
        { id: string, htmlUrl: string, title: string, url: string }
        & { __typename: 'ArchivedArticle' }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction = (
        { originalEmailURLPath: string }
        & { __typename: 'EmailInteraction' }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction = (
        { externalId: string, timestamp: string, resourceType: string }
        & { __typename: 'CustomChannelInteraction' }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction_NotImplementedOriginatedFrom = { __typename: 'TalkInteraction' | 'NotImplementedOriginatedFrom' };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction = (
        { conversationId?: string | null }
        & { __typename: 'NativeMessagingInteraction' | 'WhatsAppInteraction' | 'WeChatInteraction' }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom =
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction_NotImplementedOriginatedFrom
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction
      ;

      export type ConversationBotSolutionFragment = (
        { id: string, timestamp: string, article: ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle, originatedFrom: ConversationBotSolutionFragment_BotSolution_originatedFrom }
        & { __typename: 'BotSolution' }
      );

      export type ConversationGenericCallSummaryFragment = (
        { id: string, summary: string }
        & { __typename: 'TalkPublicCallSummary' }
      );

      export type ConversationTalkInteractionFragment = (
        { channel: string, type: CallType }
        & { __typename: 'TalkInteraction' }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction = (
        { originalEmailURLPath: string }
        & { __typename: 'EmailInteraction' }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction = (
        { externalId: string, timestamp: string, resourceType: string }
        & { __typename: 'CustomChannelInteraction' }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction_NotImplementedOriginatedFrom = { __typename: 'TalkInteraction' | 'NotImplementedOriginatedFrom' };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction = (
        { conversationId?: string | null }
        & { __typename: 'NativeMessagingInteraction' | 'WhatsAppInteraction' | 'WeChatInteraction' }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom =
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction_NotImplementedOriginatedFrom
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction
      ;

      export type ConversationConversationEventFragment = (
        { id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom }
        & { __typename: 'BrokenConversationEvent' | 'BotSolution' | 'TalkPublicCallSummary' }
      );

      type MessageEnvelopeData_EmailInteraction_Fragment = (
        { originalEmailURLPath: string }
        & { __typename: 'EmailInteraction' }
      );

      type MessageEnvelopeData_8FBboKcmuva72FpaH1zuPdoYyrlyvueTn9fqP1dFi_Fragment = { __typename: 'CustomChannelInteraction' | 'TalkInteraction' | 'NativeMessagingInteraction' | 'WhatsAppInteraction' | 'WeChatInteraction' | 'NotImplementedOriginatedFrom' };

      export type MessageEnvelopeDataFragment =
        | MessageEnvelopeData_EmailInteraction_Fragment
        | MessageEnvelopeData_8FBboKcmuva72FpaH1zuPdoYyrlyvueTn9fqP1dFi_Fragment
      ;

      export type AnyChannelOriginatedFromFragment = (
        { externalId: string, timestamp: string, resourceType: string }
        & { __typename: 'CustomChannelInteraction' }
      );

      type ConversationOriginatedFrom_EmailInteraction_Fragment = (
        { originalEmailURLPath: string }
        & { __typename: 'EmailInteraction' }
      );

      type ConversationOriginatedFrom_CustomChannelInteraction_Fragment = (
        { externalId: string, timestamp: string, resourceType: string }
        & { __typename: 'CustomChannelInteraction' }
      );

      type ConversationOriginatedFrom_TalkInteraction_NotImplementedOriginatedFrom_Fragment = { __typename: 'TalkInteraction' | 'NotImplementedOriginatedFrom' };

      type ConversationOriginatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction_Fragment = (
        { conversationId?: string | null }
        & { __typename: 'NativeMessagingInteraction' | 'WhatsAppInteraction' | 'WeChatInteraction' }
      );

      export type ConversationOriginatedFromFragment =
        | ConversationOriginatedFrom_EmailInteraction_Fragment
        | ConversationOriginatedFrom_CustomChannelInteraction_Fragment
        | ConversationOriginatedFrom_TalkInteraction_NotImplementedOriginatedFrom_Fragment
        | ConversationOriginatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction_Fragment
      ;

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction = (
        { originalEmailURLPath: string }
        & { __typename: 'EmailInteraction' }
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction = (
        { externalId: string, timestamp: string, resourceType: string }
        & { __typename: 'CustomChannelInteraction' }
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction = (
        { channel: string, type: CallType }
        & { __typename: 'TalkInteraction' }
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction = (
        { conversationId?: string | null }
        & { __typename: 'NativeMessagingInteraction' | 'WhatsAppInteraction' | 'WeChatInteraction' }
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom =
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction_WhatsAppInteraction_WeChatInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationTalkPublicCallSummaryFragment = (
        { id: string, timestamp: string, summary: string, originatedFrom: ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom }
        & { __typename: 'TalkPublicCallSummary' }
      );
      "
    `);

    await validate(content, config, complexTestSchemaWithUnionsAndInterfaces);
  });

  it("should extract types from multiple fragments (inlineFragmentTypes: 'combine')", async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      preResolveTypes: true,
      extractAllFieldsToTypes: true,
      nonOptionalTypename: true,
      dedupeOperationSuffix: true,
      inlineFragmentTypes: 'combine',
    };
    const { content } = await plugin(
      complexTestSchemaWithUnionsAndInterfaces,
      [{ location: 'test-file.ts', document: fragmentsOnComplexSchema }],
      config,
      { outputFile: '' }
    );
    expect(content).toMatchInlineSnapshot(`
      "export type ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle = { __typename: 'ArchivedArticle', id: string, htmlUrl: string, title: string, url: string };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction = (
        { __typename: 'EmailInteraction' }
        & ConversationOriginatedFrom_EmailInteraction_Fragment
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction = (
        { __typename: 'CustomChannelInteraction' }
        & ConversationOriginatedFrom_CustomChannelInteraction_Fragment
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction = (
        { __typename: 'TalkInteraction' }
        & ConversationOriginatedFrom_TalkInteraction_Fragment
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction = (
        { __typename: 'NativeMessagingInteraction' }
        & ConversationOriginatedFrom_NativeMessagingInteraction_Fragment
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction = (
        { __typename: 'WhatsAppInteraction' }
        & ConversationOriginatedFrom_WhatsAppInteraction_Fragment
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction = (
        { __typename: 'WeChatInteraction' }
        & ConversationOriginatedFrom_WeChatInteraction_Fragment
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom = (
        { __typename: 'NotImplementedOriginatedFrom' }
        & ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom =
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationBotSolutionFragment = (
        { __typename: 'BotSolution', id: string, article: ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle, originatedFrom: ConversationBotSolutionFragment_BotSolution_originatedFrom }
        & ConversationConversationEvent_BotSolution_Fragment
      );

      export type ConversationGenericCallSummaryFragment = { __typename: 'TalkPublicCallSummary', id: string, summary: string };

      export type ConversationTalkInteractionFragment = { __typename: 'TalkInteraction', channel: string, type: CallType };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction = (
        { __typename: 'EmailInteraction' }
        & ConversationOriginatedFrom_EmailInteraction_Fragment
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction = (
        { __typename: 'CustomChannelInteraction' }
        & ConversationOriginatedFrom_CustomChannelInteraction_Fragment
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction = (
        { __typename: 'TalkInteraction' }
        & ConversationOriginatedFrom_TalkInteraction_Fragment
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction = (
        { __typename: 'NativeMessagingInteraction' }
        & ConversationOriginatedFrom_NativeMessagingInteraction_Fragment
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction = (
        { __typename: 'WhatsAppInteraction' }
        & ConversationOriginatedFrom_WhatsAppInteraction_Fragment
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction = (
        { __typename: 'WeChatInteraction' }
        & ConversationOriginatedFrom_WeChatInteraction_Fragment
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom = (
        { __typename: 'NotImplementedOriginatedFrom' }
        & ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom =
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom
      ;

      type ConversationConversationEvent_BrokenConversationEvent_Fragment = { __typename: 'BrokenConversationEvent', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom };

      type ConversationConversationEvent_BotSolution_Fragment = { __typename: 'BotSolution', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom };

      type ConversationConversationEvent_TalkPublicCallSummary_Fragment = { __typename: 'TalkPublicCallSummary', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom };

      export type ConversationConversationEventFragment =
        | ConversationConversationEvent_BrokenConversationEvent_Fragment
        | ConversationConversationEvent_BotSolution_Fragment
        | ConversationConversationEvent_TalkPublicCallSummary_Fragment
      ;

      type MessageEnvelopeData_EmailInteraction_Fragment = { __typename: 'EmailInteraction', originalEmailURLPath: string };

      type MessageEnvelopeData_CustomChannelInteraction_Fragment = { __typename: 'CustomChannelInteraction' };

      type MessageEnvelopeData_TalkInteraction_Fragment = { __typename: 'TalkInteraction' };

      type MessageEnvelopeData_NativeMessagingInteraction_Fragment = { __typename: 'NativeMessagingInteraction' };

      type MessageEnvelopeData_WhatsAppInteraction_Fragment = { __typename: 'WhatsAppInteraction' };

      type MessageEnvelopeData_WeChatInteraction_Fragment = { __typename: 'WeChatInteraction' };

      type MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment = { __typename: 'NotImplementedOriginatedFrom' };

      export type MessageEnvelopeDataFragment =
        | MessageEnvelopeData_EmailInteraction_Fragment
        | MessageEnvelopeData_CustomChannelInteraction_Fragment
        | MessageEnvelopeData_TalkInteraction_Fragment
        | MessageEnvelopeData_NativeMessagingInteraction_Fragment
        | MessageEnvelopeData_WhatsAppInteraction_Fragment
        | MessageEnvelopeData_WeChatInteraction_Fragment
        | MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment
      ;

      export type AnyChannelOriginatedFromFragment = { __typename: 'CustomChannelInteraction', externalId: string, timestamp: string, resourceType: string };

      type ConversationOriginatedFrom_EmailInteraction_Fragment = (
        { __typename: 'EmailInteraction' }
        & MessageEnvelopeData_EmailInteraction_Fragment
      );

      type ConversationOriginatedFrom_CustomChannelInteraction_Fragment = (
        { __typename: 'CustomChannelInteraction' }
        & MessageEnvelopeData_CustomChannelInteraction_Fragment
        & AnyChannelOriginatedFromFragment
      );

      type ConversationOriginatedFrom_TalkInteraction_Fragment = (
        { __typename: 'TalkInteraction' }
        & MessageEnvelopeData_TalkInteraction_Fragment
      );

      type ConversationOriginatedFrom_NativeMessagingInteraction_Fragment = (
        { __typename: 'NativeMessagingInteraction', conversationId?: string | null }
        & MessageEnvelopeData_NativeMessagingInteraction_Fragment
      );

      type ConversationOriginatedFrom_WhatsAppInteraction_Fragment = (
        { __typename: 'WhatsAppInteraction', conversationId?: string | null }
        & MessageEnvelopeData_WhatsAppInteraction_Fragment
      );

      type ConversationOriginatedFrom_WeChatInteraction_Fragment = (
        { __typename: 'WeChatInteraction', conversationId?: string | null }
        & MessageEnvelopeData_WeChatInteraction_Fragment
      );

      type ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment = (
        { __typename: 'NotImplementedOriginatedFrom' }
        & MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment
      );

      export type ConversationOriginatedFromFragment =
        | ConversationOriginatedFrom_EmailInteraction_Fragment
        | ConversationOriginatedFrom_CustomChannelInteraction_Fragment
        | ConversationOriginatedFrom_TalkInteraction_Fragment
        | ConversationOriginatedFrom_NativeMessagingInteraction_Fragment
        | ConversationOriginatedFrom_WhatsAppInteraction_Fragment
        | ConversationOriginatedFrom_WeChatInteraction_Fragment
        | ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment
      ;

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction = { __typename: 'EmailInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction = { __typename: 'CustomChannelInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction = (
        { __typename: 'TalkInteraction' }
        & ConversationTalkInteractionFragment
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction = { __typename: 'NativeMessagingInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction = { __typename: 'WhatsAppInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction = { __typename: 'WeChatInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom =
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationTalkPublicCallSummaryFragment = (
        { __typename: 'TalkPublicCallSummary', id: string, originatedFrom: ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom }
        & ConversationConversationEvent_TalkPublicCallSummary_Fragment
        & ConversationGenericCallSummaryFragment
      );
      "
    `);

    await validate(content, config, complexTestSchemaWithUnionsAndInterfaces);
  });

  it("should extract types from multiple fragments (inlineFragmentTypes: 'mask')", async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      preResolveTypes: true,
      extractAllFieldsToTypes: true,
      nonOptionalTypename: true,
      dedupeOperationSuffix: true,
      inlineFragmentTypes: 'mask',
    };
    const { content } = await plugin(
      complexTestSchemaWithUnionsAndInterfaces,
      [{ location: 'test-file.ts', document: fragmentsOnComplexSchema }],
      config,
      { outputFile: '' }
    );
    expect(content).toMatchInlineSnapshot(`
      "export type ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle = { __typename: 'ArchivedArticle', id: string, htmlUrl: string, title: string, url: string };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction = (
        { __typename: 'EmailInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_EmailInteraction_Fragment': ConversationOriginatedFrom_EmailInteraction_Fragment } }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction = (
        { __typename: 'CustomChannelInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_CustomChannelInteraction_Fragment': ConversationOriginatedFrom_CustomChannelInteraction_Fragment } }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction = (
        { __typename: 'TalkInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_TalkInteraction_Fragment': ConversationOriginatedFrom_TalkInteraction_Fragment } }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction = (
        { __typename: 'NativeMessagingInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_NativeMessagingInteraction_Fragment': ConversationOriginatedFrom_NativeMessagingInteraction_Fragment } }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction = (
        { __typename: 'WhatsAppInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_WhatsAppInteraction_Fragment': ConversationOriginatedFrom_WhatsAppInteraction_Fragment } }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction = (
        { __typename: 'WeChatInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_WeChatInteraction_Fragment': ConversationOriginatedFrom_WeChatInteraction_Fragment } }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom = (
        { __typename: 'NotImplementedOriginatedFrom' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment': ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment } }
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom =
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationBotSolutionFragment = (
        { __typename: 'BotSolution', id: string, article: ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle, originatedFrom: ConversationBotSolutionFragment_BotSolution_originatedFrom }
        & { ' $fragmentRefs'?: { 'ConversationConversationEvent_BotSolution_Fragment': ConversationConversationEvent_BotSolution_Fragment } }
      ) & { ' $fragmentName'?: 'ConversationBotSolutionFragment' };

      export type ConversationGenericCallSummaryFragment = { __typename: 'TalkPublicCallSummary', id: string, summary: string } & { ' $fragmentName'?: 'ConversationGenericCallSummaryFragment' };

      export type ConversationTalkInteractionFragment = { __typename: 'TalkInteraction', channel: string, type: CallType } & { ' $fragmentName'?: 'ConversationTalkInteractionFragment' };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction = (
        { __typename: 'EmailInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_EmailInteraction_Fragment': ConversationOriginatedFrom_EmailInteraction_Fragment } }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction = (
        { __typename: 'CustomChannelInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_CustomChannelInteraction_Fragment': ConversationOriginatedFrom_CustomChannelInteraction_Fragment } }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction = (
        { __typename: 'TalkInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_TalkInteraction_Fragment': ConversationOriginatedFrom_TalkInteraction_Fragment } }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction = (
        { __typename: 'NativeMessagingInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_NativeMessagingInteraction_Fragment': ConversationOriginatedFrom_NativeMessagingInteraction_Fragment } }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction = (
        { __typename: 'WhatsAppInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_WhatsAppInteraction_Fragment': ConversationOriginatedFrom_WhatsAppInteraction_Fragment } }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction = (
        { __typename: 'WeChatInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_WeChatInteraction_Fragment': ConversationOriginatedFrom_WeChatInteraction_Fragment } }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom = (
        { __typename: 'NotImplementedOriginatedFrom' }
        & { ' $fragmentRefs'?: { 'ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment': ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment } }
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom =
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom
      ;

      type ConversationConversationEvent_BrokenConversationEvent_Fragment = { __typename: 'BrokenConversationEvent', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom } & { ' $fragmentName'?: 'ConversationConversationEvent_BrokenConversationEvent_Fragment' };

      type ConversationConversationEvent_BotSolution_Fragment = { __typename: 'BotSolution', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom } & { ' $fragmentName'?: 'ConversationConversationEvent_BotSolution_Fragment' };

      type ConversationConversationEvent_TalkPublicCallSummary_Fragment = { __typename: 'TalkPublicCallSummary', id: string, timestamp: string, originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom } & { ' $fragmentName'?: 'ConversationConversationEvent_TalkPublicCallSummary_Fragment' };

      export type ConversationConversationEventFragment =
        | ConversationConversationEvent_BrokenConversationEvent_Fragment
        | ConversationConversationEvent_BotSolution_Fragment
        | ConversationConversationEvent_TalkPublicCallSummary_Fragment
      ;

      type MessageEnvelopeData_EmailInteraction_Fragment = { __typename: 'EmailInteraction', originalEmailURLPath: string } & { ' $fragmentName'?: 'MessageEnvelopeData_EmailInteraction_Fragment' };

      type MessageEnvelopeData_CustomChannelInteraction_Fragment = { __typename: 'CustomChannelInteraction' } & { ' $fragmentName'?: 'MessageEnvelopeData_CustomChannelInteraction_Fragment' };

      type MessageEnvelopeData_TalkInteraction_Fragment = { __typename: 'TalkInteraction' } & { ' $fragmentName'?: 'MessageEnvelopeData_TalkInteraction_Fragment' };

      type MessageEnvelopeData_NativeMessagingInteraction_Fragment = { __typename: 'NativeMessagingInteraction' } & { ' $fragmentName'?: 'MessageEnvelopeData_NativeMessagingInteraction_Fragment' };

      type MessageEnvelopeData_WhatsAppInteraction_Fragment = { __typename: 'WhatsAppInteraction' } & { ' $fragmentName'?: 'MessageEnvelopeData_WhatsAppInteraction_Fragment' };

      type MessageEnvelopeData_WeChatInteraction_Fragment = { __typename: 'WeChatInteraction' } & { ' $fragmentName'?: 'MessageEnvelopeData_WeChatInteraction_Fragment' };

      type MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment = { __typename: 'NotImplementedOriginatedFrom' } & { ' $fragmentName'?: 'MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment' };

      export type MessageEnvelopeDataFragment =
        | MessageEnvelopeData_EmailInteraction_Fragment
        | MessageEnvelopeData_CustomChannelInteraction_Fragment
        | MessageEnvelopeData_TalkInteraction_Fragment
        | MessageEnvelopeData_NativeMessagingInteraction_Fragment
        | MessageEnvelopeData_WhatsAppInteraction_Fragment
        | MessageEnvelopeData_WeChatInteraction_Fragment
        | MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment
      ;

      export type AnyChannelOriginatedFromFragment = { __typename: 'CustomChannelInteraction', externalId: string, timestamp: string, resourceType: string } & { ' $fragmentName'?: 'AnyChannelOriginatedFromFragment' };

      type ConversationOriginatedFrom_EmailInteraction_Fragment = (
        { __typename: 'EmailInteraction' }
        & { ' $fragmentRefs'?: { 'MessageEnvelopeData_EmailInteraction_Fragment': MessageEnvelopeData_EmailInteraction_Fragment } }
      ) & { ' $fragmentName'?: 'ConversationOriginatedFrom_EmailInteraction_Fragment' };

      type ConversationOriginatedFrom_CustomChannelInteraction_Fragment = (
        { __typename: 'CustomChannelInteraction' }
        & { ' $fragmentRefs'?: { 'MessageEnvelopeData_CustomChannelInteraction_Fragment': MessageEnvelopeData_CustomChannelInteraction_Fragment;'AnyChannelOriginatedFromFragment': AnyChannelOriginatedFromFragment } }
      ) & { ' $fragmentName'?: 'ConversationOriginatedFrom_CustomChannelInteraction_Fragment' };

      type ConversationOriginatedFrom_TalkInteraction_Fragment = (
        { __typename: 'TalkInteraction' }
        & { ' $fragmentRefs'?: { 'MessageEnvelopeData_TalkInteraction_Fragment': MessageEnvelopeData_TalkInteraction_Fragment } }
      ) & { ' $fragmentName'?: 'ConversationOriginatedFrom_TalkInteraction_Fragment' };

      type ConversationOriginatedFrom_NativeMessagingInteraction_Fragment = (
        { __typename: 'NativeMessagingInteraction', conversationId?: string | null }
        & { ' $fragmentRefs'?: { 'MessageEnvelopeData_NativeMessagingInteraction_Fragment': MessageEnvelopeData_NativeMessagingInteraction_Fragment } }
      ) & { ' $fragmentName'?: 'ConversationOriginatedFrom_NativeMessagingInteraction_Fragment' };

      type ConversationOriginatedFrom_WhatsAppInteraction_Fragment = (
        { __typename: 'WhatsAppInteraction', conversationId?: string | null }
        & { ' $fragmentRefs'?: { 'MessageEnvelopeData_WhatsAppInteraction_Fragment': MessageEnvelopeData_WhatsAppInteraction_Fragment } }
      ) & { ' $fragmentName'?: 'ConversationOriginatedFrom_WhatsAppInteraction_Fragment' };

      type ConversationOriginatedFrom_WeChatInteraction_Fragment = (
        { __typename: 'WeChatInteraction', conversationId?: string | null }
        & { ' $fragmentRefs'?: { 'MessageEnvelopeData_WeChatInteraction_Fragment': MessageEnvelopeData_WeChatInteraction_Fragment } }
      ) & { ' $fragmentName'?: 'ConversationOriginatedFrom_WeChatInteraction_Fragment' };

      type ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment = (
        { __typename: 'NotImplementedOriginatedFrom' }
        & { ' $fragmentRefs'?: { 'MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment': MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment } }
      ) & { ' $fragmentName'?: 'ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment' };

      export type ConversationOriginatedFromFragment =
        | ConversationOriginatedFrom_EmailInteraction_Fragment
        | ConversationOriginatedFrom_CustomChannelInteraction_Fragment
        | ConversationOriginatedFrom_TalkInteraction_Fragment
        | ConversationOriginatedFrom_NativeMessagingInteraction_Fragment
        | ConversationOriginatedFrom_WhatsAppInteraction_Fragment
        | ConversationOriginatedFrom_WeChatInteraction_Fragment
        | ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment
      ;

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction = { __typename: 'EmailInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction = { __typename: 'CustomChannelInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction = (
        { __typename: 'TalkInteraction' }
        & { ' $fragmentRefs'?: { 'ConversationTalkInteractionFragment': ConversationTalkInteractionFragment } }
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction = { __typename: 'NativeMessagingInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction = { __typename: 'WhatsAppInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction = { __typename: 'WeChatInteraction' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom =
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationTalkPublicCallSummaryFragment = (
        { __typename: 'TalkPublicCallSummary', id: string, originatedFrom: ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom }
        & { ' $fragmentRefs'?: { 'ConversationConversationEvent_TalkPublicCallSummary_Fragment': ConversationConversationEvent_TalkPublicCallSummary_Fragment;'ConversationGenericCallSummaryFragment': ConversationGenericCallSummaryFragment } }
      ) & { ' $fragmentName'?: 'ConversationTalkPublicCallSummaryFragment' };
      "
    `);

    await validate(content, config, complexTestSchemaWithUnionsAndInterfaces);
  });

  it('should extract types from multiple fragments (preResolveTypes: false)', async () => {
    const config: TypeScriptDocumentsPluginConfig = {
      preResolveTypes: false,
      extractAllFieldsToTypes: true,
      nonOptionalTypename: true,
      dedupeOperationSuffix: true,
    };
    const { content } = await plugin(
      complexTestSchemaWithUnionsAndInterfaces,
      [{ location: 'test-file.ts', document: fragmentsOnComplexSchema }],
      config,
      { outputFile: '' }
    );
    expect(content).toMatchInlineSnapshot(`
      "export type ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle = (
        { __typename: 'ArchivedArticle' }
        & Pick<
          ArchivedArticle,
          | 'id'
          | 'htmlUrl'
          | 'title'
          | 'url'
        >
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction = (
        { __typename: 'EmailInteraction' }
        & Pick<EmailInteraction, 'originalEmailURLPath'>
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction = (
        { __typename: 'CustomChannelInteraction' }
        & Pick<CustomChannelInteraction, 'externalId' | 'timestamp' | 'resourceType'>
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction = { __typename: 'TalkInteraction' };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction = (
        { __typename: 'NativeMessagingInteraction' }
        & Pick<NativeMessagingInteraction, 'conversationId'>
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction = (
        { __typename: 'WhatsAppInteraction' }
        & Pick<WhatsAppInteraction, 'conversationId'>
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction = (
        { __typename: 'WeChatInteraction' }
        & Pick<WeChatInteraction, 'conversationId'>
      );

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationBotSolutionFragment_BotSolution_originatedFrom =
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_EmailInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_CustomChannelInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_TalkInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NativeMessagingInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WhatsAppInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_WeChatInteraction
        | ConversationBotSolutionFragment_BotSolution_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationBotSolutionFragment = (
        { __typename: 'BotSolution' }
        & Pick<BotSolution, 'id' | 'timestamp'>
        & {
          article: ConversationBotSolutionFragment_BotSolution_article_ArchivedArticle,
          originatedFrom: ConversationBotSolutionFragment_BotSolution_originatedFrom,
        }
      );

      export type ConversationGenericCallSummaryFragment = (
        { __typename: 'TalkPublicCallSummary' }
        & Pick<TalkPublicCallSummary, 'id' | 'summary'>
      );

      export type ConversationTalkInteractionFragment = (
        { __typename: 'TalkInteraction' }
        & Pick<TalkInteraction, 'channel' | 'type'>
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction = (
        { __typename: 'EmailInteraction' }
        & Pick<EmailInteraction, 'originalEmailURLPath'>
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction = (
        { __typename: 'CustomChannelInteraction' }
        & Pick<CustomChannelInteraction, 'externalId' | 'timestamp' | 'resourceType'>
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction = { __typename: 'TalkInteraction' };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction = (
        { __typename: 'NativeMessagingInteraction' }
        & Pick<NativeMessagingInteraction, 'conversationId'>
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction = (
        { __typename: 'WhatsAppInteraction' }
        & Pick<WhatsAppInteraction, 'conversationId'>
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction = (
        { __typename: 'WeChatInteraction' }
        & Pick<WeChatInteraction, 'conversationId'>
      );

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom =
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_EmailInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_CustomChannelInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_TalkInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NativeMessagingInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WhatsAppInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_WeChatInteraction
        | ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom_NotImplementedOriginatedFrom
      ;

      type ConversationConversationEvent_BrokenConversationEvent_Fragment = (
        { __typename: 'BrokenConversationEvent' }
        & Pick<BrokenConversationEvent, 'id' | 'timestamp'>
        & { originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom }
      );

      type ConversationConversationEvent_BotSolution_Fragment = (
        { __typename: 'BotSolution' }
        & Pick<BotSolution, 'id' | 'timestamp'>
        & { originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom }
      );

      type ConversationConversationEvent_TalkPublicCallSummary_Fragment = (
        { __typename: 'TalkPublicCallSummary' }
        & Pick<TalkPublicCallSummary, 'id' | 'timestamp'>
        & { originatedFrom: ConversationConversationEventFragment_BrokenConversationEvent_originatedFrom }
      );

      export type ConversationConversationEventFragment =
        | ConversationConversationEvent_BrokenConversationEvent_Fragment
        | ConversationConversationEvent_BotSolution_Fragment
        | ConversationConversationEvent_TalkPublicCallSummary_Fragment
      ;

      type MessageEnvelopeData_EmailInteraction_Fragment = (
        { __typename: 'EmailInteraction' }
        & Pick<EmailInteraction, 'originalEmailURLPath'>
      );

      type MessageEnvelopeData_CustomChannelInteraction_Fragment = { __typename: 'CustomChannelInteraction' };

      type MessageEnvelopeData_TalkInteraction_Fragment = { __typename: 'TalkInteraction' };

      type MessageEnvelopeData_NativeMessagingInteraction_Fragment = { __typename: 'NativeMessagingInteraction' };

      type MessageEnvelopeData_WhatsAppInteraction_Fragment = { __typename: 'WhatsAppInteraction' };

      type MessageEnvelopeData_WeChatInteraction_Fragment = { __typename: 'WeChatInteraction' };

      type MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment = { __typename: 'NotImplementedOriginatedFrom' };

      export type MessageEnvelopeDataFragment =
        | MessageEnvelopeData_EmailInteraction_Fragment
        | MessageEnvelopeData_CustomChannelInteraction_Fragment
        | MessageEnvelopeData_TalkInteraction_Fragment
        | MessageEnvelopeData_NativeMessagingInteraction_Fragment
        | MessageEnvelopeData_WhatsAppInteraction_Fragment
        | MessageEnvelopeData_WeChatInteraction_Fragment
        | MessageEnvelopeData_NotImplementedOriginatedFrom_Fragment
      ;

      export type AnyChannelOriginatedFromFragment = (
        { __typename: 'CustomChannelInteraction' }
        & Pick<CustomChannelInteraction, 'externalId' | 'timestamp' | 'resourceType'>
      );

      type ConversationOriginatedFrom_EmailInteraction_Fragment = (
        { __typename: 'EmailInteraction' }
        & Pick<EmailInteraction, 'originalEmailURLPath'>
      );

      type ConversationOriginatedFrom_CustomChannelInteraction_Fragment = (
        { __typename: 'CustomChannelInteraction' }
        & Pick<CustomChannelInteraction, 'externalId' | 'timestamp' | 'resourceType'>
      );

      type ConversationOriginatedFrom_TalkInteraction_Fragment = { __typename: 'TalkInteraction' };

      type ConversationOriginatedFrom_NativeMessagingInteraction_Fragment = (
        { __typename: 'NativeMessagingInteraction' }
        & Pick<NativeMessagingInteraction, 'conversationId'>
      );

      type ConversationOriginatedFrom_WhatsAppInteraction_Fragment = (
        { __typename: 'WhatsAppInteraction' }
        & Pick<WhatsAppInteraction, 'conversationId'>
      );

      type ConversationOriginatedFrom_WeChatInteraction_Fragment = (
        { __typename: 'WeChatInteraction' }
        & Pick<WeChatInteraction, 'conversationId'>
      );

      type ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationOriginatedFromFragment =
        | ConversationOriginatedFrom_EmailInteraction_Fragment
        | ConversationOriginatedFrom_CustomChannelInteraction_Fragment
        | ConversationOriginatedFrom_TalkInteraction_Fragment
        | ConversationOriginatedFrom_NativeMessagingInteraction_Fragment
        | ConversationOriginatedFrom_WhatsAppInteraction_Fragment
        | ConversationOriginatedFrom_WeChatInteraction_Fragment
        | ConversationOriginatedFrom_NotImplementedOriginatedFrom_Fragment
      ;

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction = (
        { __typename: 'EmailInteraction' }
        & Pick<EmailInteraction, 'originalEmailURLPath'>
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction = (
        { __typename: 'CustomChannelInteraction' }
        & Pick<CustomChannelInteraction, 'externalId' | 'timestamp' | 'resourceType'>
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction = (
        { __typename: 'TalkInteraction' }
        & Pick<TalkInteraction, 'channel' | 'type'>
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction = (
        { __typename: 'NativeMessagingInteraction' }
        & Pick<NativeMessagingInteraction, 'conversationId'>
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction = (
        { __typename: 'WhatsAppInteraction' }
        & Pick<WhatsAppInteraction, 'conversationId'>
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction = (
        { __typename: 'WeChatInteraction' }
        & Pick<WeChatInteraction, 'conversationId'>
      );

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom = { __typename: 'NotImplementedOriginatedFrom' };

      export type ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom =
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_EmailInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_CustomChannelInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_TalkInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NativeMessagingInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WhatsAppInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_WeChatInteraction
        | ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom_NotImplementedOriginatedFrom
      ;

      export type ConversationTalkPublicCallSummaryFragment = (
        { __typename: 'TalkPublicCallSummary' }
        & Pick<TalkPublicCallSummary, 'id' | 'timestamp' | 'summary'>
        & { originatedFrom: ConversationTalkPublicCallSummaryFragment_TalkPublicCallSummary_originatedFrom }
      );
      "
    `);

    await validate(content, config, complexTestSchemaWithUnionsAndInterfaces);
  });
});
