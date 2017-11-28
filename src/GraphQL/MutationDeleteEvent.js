import gql from "graphql-tag";

export default gql(`
mutation($id: ID!) {
  deleteEvent(id: $id) {
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
}`);
