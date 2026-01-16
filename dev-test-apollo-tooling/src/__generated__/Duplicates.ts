/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export enum ProcessableFeedbackSortBy {
  OPTION_1 = 'OPTION_1',
  OPTION_2 = 'OPTION_2',
  OPTION_3 = 'OPTION_3',
  OPTION_4 = 'OPTION_4',
}

export enum ProcessableFeedbackSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export type ConfigTypeDefinitions_ConfigActionId = {
  __typename: 'ConfigActionId';
  identifier: string;
};

export type ConfigTypeDefinitions_ConfigEnum = {
  __typename: 'ConfigEnum';
  identifier: string;
  values: Array<string>;
};

export type ConfigTypeDefinitions_ConfigIconResource = {
  __typename: 'ConfigIconResource';
};

export type ConfigTypeDefinitions_ConfigIllustrationResource = {
  __typename: 'ConfigIllustrationResource';
};

export type ConfigTypeDefinitions_ConfigString = {
  __typename: 'ConfigString';
  identifier: string;
  supportedHtmlTags: Array<string> | null;
};

export type ConfigTypeDefinitions_ConfigStruct = {
  __typename: 'ConfigStruct';
};

export type ConfigTypeDefinitions =
  | ConfigTypeDefinitions_ConfigActionId
  | ConfigTypeDefinitions_ConfigEnum
  | ConfigTypeDefinitions_ConfigIconResource
  | ConfigTypeDefinitions_ConfigIllustrationResource
  | ConfigTypeDefinitions_ConfigString
  | ConfigTypeDefinitions_ConfigStruct;

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_avatar_imageUrl =
  {
    __typename: 'EndUserImageUrl';
    url: string | null;
  };

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_avatar =
  {
    __typename: 'EndUserAvatar';
    imageUrl: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_avatar_imageUrl | null;
  };

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_OrgMember_avatar_imageUrl =
  {
    __typename: 'OrgMemberImageUrl';
    url: string | null;
  };

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_OrgMember_avatar =
  {
    __typename: 'OrgMemberAvatar';
    imageUrl: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_OrgMember_avatar_imageUrl | null;
  };

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_EndUser =
  {
    __typename: 'EndUser';
    id: string;
    fullName: string | null;
    avatar: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_avatar | null;
  };

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_OrgMember =
  {
    __typename: 'OrgMember';
    id: string;
    fullName: string | null;
    avatar: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_OrgMember_avatar | null;
  };

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator =

    | GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_EndUser
    | GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator_OrgMember;

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node =
  {
    __typename: 'ThreadPost';
    creator: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node_creator | null;
  };

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges = {
  __typename: 'ThreadPostEdge';
  node: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges_node | null;
};

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts = {
  __typename: 'ThreadPostConnection';
  edges: Array<GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts_edges | null> | null;
};

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread = {
  __typename: 'Thread';
  id: string;
  posts: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread_posts | null;
};

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node = {
  __typename: 'Feedback';
  id: string;
  orgMemberThread: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node_orgMemberThread | null;
};

export type GetFeedbackData_organization_internalOrgData_processableFeedback_edges = {
  __typename: 'FeedbackEdge';
  node: GetFeedbackData_organization_internalOrgData_processableFeedback_edges_node | null;
};

export type GetFeedbackData_organization_internalOrgData_processableFeedback = {
  __typename: 'FeedbackConnection';
  edges: Array<GetFeedbackData_organization_internalOrgData_processableFeedback_edges | null> | null;
};

export type GetFeedbackData_organization_internalOrgData = {
  __typename: 'InternalOrgData';
  processableFeedback: GetFeedbackData_organization_internalOrgData_processableFeedback | null;
};

export type GetFeedbackData_organization = {
  __typename: 'Organization';
  internalOrgData: GetFeedbackData_organization_internalOrgData | null;
};

export type GetFeedbackData = {
  organization: GetFeedbackData_organization | null;
};

export type GetFeedbackDataVariables = Exact<{
  organizationId: string;
  first?: number | null | undefined;
  after?: string | null | undefined;
  scoreFilter?: Array<number | null | undefined> | number | null | undefined;
  sortBy?: ProcessableFeedbackSortBy | null | undefined;
  sortOrder?: ProcessableFeedbackSortOrder | null | undefined;
}>;
