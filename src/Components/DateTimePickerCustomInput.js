import React, { Component } from "react";
import PropTypes from "prop-types";

export default class DateTimePickerCustomInput extends Component {

    render() {
        return (
            <button id={this.props.id} className="ui labeled icon button fluid" onClick={this.props.onClick}>
                <i className="icon calendar"></i>
                {this.props.value}
            </button>
        )
    }
}

DateTimePickerCustomInput.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string,
    id: PropTypes.string,
};
