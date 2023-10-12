import gql from 'graphql-tag';

export const WPColumns = gql`
  fragment WPColumns on WpCoreColumnsBlock {
    __typename
    attributes {
      ... on WpCoreColumnsBlockAttributes {
        align
        verticalAlignment
      }
    }
    innerBlocks {
      ...WpColumnFields
      ...WpCoreImageBlockFragment
      ...WpCoreGalleryBlockFragment
      innerBlocks {
        __typename
        ...WpCoreImageBlockForGalleryFragment
        ...WpCoreGalleryBlockFragment
        saveContent
        dynamicContent
        isDynamic
        #
        ... on WpCoreGalleryBlock {
          __typename
          ...WpCoreGalleryBlockFragment

          innerBlocks {
            __typename
            ...WpCoreImageBlockForGalleryFragment
          }
        }
        ... on WpCoreColumnsBlock {
          innerBlocks {
            ...WpColumnFields
            innerBlocks {
              ...WpCoreImageBlockFragment
              ...WpCoreGalleryBlockFragment
              ... on WpCoreColumnsBlock {
                innerBlocks {
                  ...WpColumnFields
                  innerBlocks {
                    ...WpCoreImageBlockForGalleryFragment
                    ...WpCoreGalleryBlockFragment
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const wpColumnFields = gql`
  fragment WpColumnFields on WpCoreColumnBlock {
    __typename
    saveContent
    dynamicContent
    isDynamic
    attributes {
      __typename
    }
  }
`;

export const WpCoreImageBlockFragment = gql`
  fragment WpCoreImageBlockFragment on WpCoreImageBlock {
    __typename
    saveContent
    originalContent
    attributes {
      __typename
      ... on WpCoreImageBlockAttributes {
        id
        alt
        caption
        width
        title
        height
        linkTarget
        url
        imageFluid {
          childImageSharp {
            gatsbyImageData(quality: 100, layout: FULL_WIDTH)
          }
        }
      }
    }
  }
`;

export const WpCoreImageBlockForGalleryFragment = gql`
  fragment WpCoreImageBlockForGalleryFragment on WpCoreImageBlock {
    __typename
    saveContent
    attributes {
      __typename
      ... on WpCoreImageBlockAttributes {
        id
        alt
        caption
        width
        title
        height
        linkTarget
        url
        imageFluid {
          childImageSharp {
            full: gatsbyImageData(quality: 100, layout: FULL_WIDTH)
            thumbnail: gatsbyImageData(layout: CONSTRAINED)
          }
        }
      }
    }
  }
`;

export const WpCoreParagraphBlockFragment = gql`
  fragment WpCoreParagraphBlockFragment on WpCoreParagraphBlock {
    __typename
    saveContent
    isDynamic
    dynamicContent
  }
`;

export const WpCoreGalleryBlockFragment = gql`
  fragment WpCoreGalleryBlockFragment on WpCoreGalleryBlock {
    dynamicContent
    attributes {
      ... on WpCoreGalleryBlockAttributes {
        align
        anchor
        ids
        caption
        images {
          id
          url
          link
          alt
          caption
        }
        className
      }
    }
  }
`;
