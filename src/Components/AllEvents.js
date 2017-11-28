import React, { Component } from "react";
import { Link } from "react-router-dom";

import { graphql, compose } from "react-apollo";
import QueryAllEvents from "../GraphQL/QueryAllEvents";
import MutationDeleteEvent from "../GraphQL/MutationDeleteEvent";

import moment from "moment";

class AllEvents extends Component {

    static defaultProps = {
        events: [],
        deleteEvent: () => null,
    }

    async handleDeleteClick(event, e) {
        e.preventDefault();

        if (window.confirm(`Are you sure you want to delete event ${event.id}`)) {
            const { deleteEvent } = this.props;

            await deleteEvent(event);
        }
    }

    renderEvent = (event) => (
        <Link to={`/event/${event.id}`} className="card" key={event.id}>
            <div className="content">
                <div className="header">{event.name}</div>
            </div>
            <div className="content">
                <p><i className="icon calendar"></i>{moment(event.when).format('LL')}</p>
                <p><i className="icon clock"></i>{moment(event.when).format('LT')}</p>
                <p><i className="icon marker"></i>{event.where}</p>
            </div>
            <div className="content">
                <div className="description"><i className="icon info circle"></i>{event.description}</div>
            </div>
            <div className="extra content">
                <i className="icon comment"></i> {event.comments.items.length} comments
            </div>
            <button className="ui bottom attached button" onClick={this.handleDeleteClick.bind(this, event)}>
                <i className="trash icon"></i>
                Delete
            </button>
        </Link>
    );

    render() {
        const { events } = this.props;

        return (
            <div className="ui link cards">
                <div className="card blue">
                    <Link to="/newEvent" className="new-event content center aligned">
                        <i className="icon add massive"></i>
                        <p>Create new event</p>
                    </Link>
                </div>
                {[].concat(events).sort((a, b) => a.when.localeCompare(b.when)).map(this.renderEvent)}
            </div>
        );
    }

}

export default compose(
    graphql(
        QueryAllEvents,
        {
            options: {
                fetchPolicy: 'cache-and-network',
            },
            props: ({ data: { listEvents = { items: [] } } }) => ({
                events: listEvents.items
            })
        }
    ),
    graphql(
        MutationDeleteEvent,
        {
            options: {
                fetchPolicy: 'cache-and-network',
                refetchQueries: [{ query: QueryAllEvents }],
                update: (proxy, { data: { deleteEvent } }) => {
                    const query = QueryAllEvents;
                    const data = proxy.readQuery({ query });

                    data.listEvents.items = data.listEvents.items.filter(event => event.id !== deleteEvent.id);

                    proxy.writeQuery({ query, data });
                }
            },
            props: (props) => ({
                deleteEvent: (event) => {
                    return props.mutate({
                        variables: { id: event.id },
                        optimisticResponse: () => ({
                            deleteEvent: {
                                ...event, __typename: 'Event', comments: { __typename: 'CommentConnection', items: [] }
                            }
                        }),
                    });
                }
            })
        }
    )
)(AllEvents);
