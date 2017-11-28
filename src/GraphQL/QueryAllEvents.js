import gql from "graphql-tag";

export default gql(`
query {
  listEvents {
    items {
      id
      name
      where
      when
      description
      comments {
        items {
          commentId
        }
      }
    }
  }
}`);
