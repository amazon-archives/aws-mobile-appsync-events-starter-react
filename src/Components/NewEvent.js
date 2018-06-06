import React, { Component } from "react";
import { Link } from "react-router-dom";

import { v4 as uuid } from "uuid";
import { graphql } from "react-apollo";
import QueryAllEvents from "../GraphQL/QueryAllEvents";
import QueryGetEvent from "../GraphQL/QueryGetEvent";
import MutationCreateEvent from "../GraphQL/MutationCreateEvent";

import DatePicker from 'react-datepicker';
import moment from 'moment';

import { nearest15min } from "../Utils";
import DateTimePickerCustomInput from "./DateTimePickerCustomInput";

class NewEvent extends Component {

    static defaultProps = {
        createEvent: () => null,
    }

    state = {
        event: {
            name: '',
            when: nearest15min().format(),
            where: '',
            description: '',
        }
    };

    handleChange(field, { target: { value } }) {
        const { event } = this.state;

        event[field] = value;

        this.setState({ event });
    }

    handleDateChange(field, value) {
        this.handleChange(field, { target: { value: value.format() } });
    }

    handleSave = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { createEvent, history } = this.props;
        const { event } = this.state;

        await createEvent({ ...event });

        history.push('/');
    }

    render() {
        const { event } = this.state;

        return (
            <div className="ui container raised very padded segment">
                <h1 className="ui header">Create an event</h1>
                <div className="ui form">
                    <div className="field required eight wide">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" value={event.name} onChange={this.handleChange.bind(this, 'name')} />
                    </div>
                    <div className="field required eight wide">
                        <label htmlFor="when">When</label>
                        <DatePicker
                            className="ui container"
                            customInput={<DateTimePickerCustomInput />}
                            id="when"
                            selected={moment(event.when)}
                            onChange={this.handleDateChange.bind(this, 'when')}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            showTimeSelect
                            timeFormat="hh:mm a"
                            timeIntervals={15}
                            dateFormat="LL LT"
                        />
                    </div>
                    <div className="field required eight wide">
                        <label htmlFor="where">Where</label>
                        <input type="text" id="where" value={event.where} onChange={this.handleChange.bind(this, 'where')} />
                    </div>
                    <div className="field required eight wide">
                        <label htmlFor="description">Description</label>
                        <textarea name="description" id="description" rows="10" value={event.description}
                            onChange={this.handleChange.bind(this, 'description')}></textarea>
                    </div>
                    <div className="ui buttons">
                        <Link to="/" className="ui button">Cancel</Link>
                        <div className="or"></div>
                        <button className="ui positive button" onClick={this.handleSave}>Save</button>
                    </div>
                </div>
            </div>
        );
    }

}

export default graphql(
    MutationCreateEvent,
    {
        props: (props) => ({
            createEvent: (event) => {
                return props.mutate({
                    update: (proxy, { data: { createEvent } }) => {
                        // Update QueryAllEvents
                        const query = QueryAllEvents;
                        const data = proxy.readQuery({ query });

                        data.listEvents.items = [...data.listEvents.items.filter(e => e.id !== createEvent.id), createEvent];

                        proxy.writeQuery({ query, data });

                        // Create cache entry for QueryGetEvent
                        const query2 = QueryGetEvent;
                        const variables = { id: createEvent.id };
                        const data2 = { getEvent: { ...createEvent } };

                        proxy.writeQuery({ query: query2, variables, data: data2 });
                    },
                    variables: event,
                    optimisticResponse: () => ({
                        createEvent: {
                            ...event, id: uuid(), __typename: 'Event', comments: { __typename: 'CommentConnection', items: [] }
                        }
                    }),
                })
            }
        })
    }
)(NewEvent);
