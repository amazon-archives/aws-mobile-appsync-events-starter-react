import gql from "graphql-tag";

export default gql(`
subscription($eventId: String!) {
  subscribeToEventComments(eventId: $eventId) {
    eventId
    commentId
  }
}`);
