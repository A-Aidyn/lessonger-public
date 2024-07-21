import React from 'react';
import { Modal } from 'antd';
import JoinChatForm from '../forms/JoinChat';

class JoinChatModal extends React.Component {

  render() {
    return (

        <Modal
          centered
          footer={null}
          visible={this.props.isVisible}
          onCancel={this.props.close}
        >
            <JoinChatForm
                chatId = {this.props.chatId}
            />
        </Modal>

    );
  }
}

export default JoinChatModal;
