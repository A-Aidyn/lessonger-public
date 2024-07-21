import React from 'react';
import { Modal } from 'antd';
import AddKLMSForm from '../forms/Klms';

class AddKLMSModal extends React.Component {

  render() {
    return (

        <Modal
          centered
          footer={null}
          visible={this.props.isVisible}
          onCancel={this.props.close}
        >
            <AddKLMSForm />
        </Modal>

    );
  }
}

export default AddKLMSModal;