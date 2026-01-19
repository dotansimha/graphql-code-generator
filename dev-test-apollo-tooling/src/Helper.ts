import { gql } from '@apollo/client';

const getHelperFieldsFragment = gql`
  fragment HelperFields on UserManager {
    roleType
    fooUser {
      profilePhoto {
        photoUrl {
          url(size: SQUARE_300)
        }
      }
    }
  }
`;

export const helperPropsFromFragment = (fragment: any) => ({
  profilePhotoUrl: fragment.fooUser.profilePhoto?.photoUrl.url,
  roleType: fragment.roleType,
});

const Helper = { fragments: { query: {} } };

Helper.fragments = {
  query: getHelperFieldsFragment,
};

export default Helper;
