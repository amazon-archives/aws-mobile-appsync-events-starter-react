import React, { Component } from "react";
import { graphql } from "react-apollo";

import moment from 'moment';

import QueryGetEvent from "../GraphQL/QueryGetEvent";
import SubscriptionEventComments from "../GraphQL/SubscriptionEventComments";

import NewComment from "./NewComment";

class EventComments extends Component {

    subscription;

    componentDidMount() {
        this.subscription = this.props.subscribeToComments();
    }

    componentWillUnmount() {
        this.subscription();
    }

    renderComment = (comment) => {
        return (
            <div className="comment" key={comment.commentId}>
                <div className="avatar"><i className="icon user circular"></i></div>
                <div className="content">
                    <div className="text">
                        {comment.content}
                    </div>
                    <div className="metadata">{moment(comment.createdAt).format('LL, LT')}</div>
                </div>
            </div>
        );
    }

    render() {
        const { comments: { items }, eventId } = this.props;

        return (
            <div className="ui items">
                <div className="item">
                    <div className="ui comments">
                        <h4 className="ui dividing header">Comments</h4>
                        {[].concat(items).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(this.renderComment)}
                        <NewComment eventId={eventId} />
                    </div>
                </div>
            </div>
        );
    }

}

const EventCommentsWithData = graphql(
    QueryGetEvent,
    {
        options: ({ eventId: id }) => ({
            fetchPolicy: 'cache-first',
            variables: { id }
        }),
        props: props => ({
            comments: props.data.getEvent.comments,
            subscribeToComments: () => props.data.subscribeToMore({
                document: SubscriptionEventComments,
                variables: {
                    eventId: props.ownProps.eventId,
                },
                updateQuery: (prev, { subscriptionData: { data: { subscribeToEventComments } } }) => {
                    const res = {
                        ...prev,
                        ...{
                            getEvent: {
                                ...prev.getEvent,
                                comments: {
                                    __typename: 'CommentConnections',
                                    items: [
                                        ...prev.getEvent.comments.items.filter(c => {
                                            return (
                                                c.content !== subscribeToEventComments.content &&
                                                c.createdAt !== subscribeToEventComments.createdAt &&
                                                c.commentId !== subscribeToEventComments.commentId
                                            );
                                        }),
                                        subscribeToEventComments,
                                    ]
                                }
                            }
                        },
                    };

                    return res;
                }
            })
        }),
    },
)(EventComments);

export default EventCommentsWithData;
