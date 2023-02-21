import { gql } from '@apollo/client';

export const GET_ME = gql`
query Me {
  me {
    bookCount
    savedBooks {
      title
      description
      bookId
      authors
      image
    }
    email
    username
    _id
  }
}
`;

export const QUERY_USER = gql`
  query user($username: String!) {
    user(username: $username) {
      _id
      username
      email
    }
  }
`;