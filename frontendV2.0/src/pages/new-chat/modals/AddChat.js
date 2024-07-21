import React from 'react';
import { Modal } from 'antd';
import AddChatForm from '../forms/AddChat';

class AddChatModal extends React.Component {

  render() {
    return (

        <Modal
          centered
          footer={null}
          visible={this.props.isVisible}
          onCancel={this.props.close}
        >
            <AddChatForm
                channel={this.props.channel}
            />
        </Modal>

    );
  }
}

export default AddChatModal;
