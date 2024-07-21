import React, { Component } from 'react'
//<PinnedMessage message={messages[1]} onClick={executeScroll} />

export default class PinnedMessage extends Component {
    constructor(props) {
        super(props);
    }

    render() {



        const { message, onClick } = this.props;
        return (
            <div onClick={onClick} className='pinned-message'
                style={{
                    'borderWidth': '1px',
                    'borderStyle': 'solid',
                    'borderColor': 'blue',
                    'background': '#CCC',
                    'height': '42px',
                }}
            >
                <p style={{ 'color': 'red' }}>  Pinned message: </p>
                {message.content}
            </div>
        )
    }
}
