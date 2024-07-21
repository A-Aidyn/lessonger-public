import {Avatar, Button, Collapse, Comment, Space} from "antd";
import {EnterOutlined} from "@ant-design/icons";
import React from "react";

const ExampleComment = ({actions}) => (
    <Comment
        actions={actions}
        author={<a>Han Solo</a>}
        avatar={
            <Avatar
                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                alt="Han Solo"
            />
        }
        content={
            <p>
                We supply a series of design principles, practical patterns and high quality design
                resources (Sketch and Axure).
            </p>
        }
    />
);

const tempo = (
   <Text type={'success'} ellipsis={true} style={{width: 700}}> {this.state.panel_header_text} </Text>
);

const myCollapse = (
    <Collapse bordered={false} ghost onChange={this.panelChange}>
        <Panel header={tempo} className={'custom-panel'}>
            <>
                <ExampleComment/>
                <ExampleComment/>
                <ExampleComment/>
                <ExampleComment/>
                <Space>
                    <EnterOutlined />
                    <Button style={{margin: 0, padding: 0}} type={'link'}> Reply </Button>
                </Space>
            </>
        </Panel>
    </Collapse>
);

const tmp = (
    <>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[
            <Space>
                <EnterOutlined />
                <Button style={{margin: 0, padding: 0}} type={'link'}> Reply </Button>
            </Space>
        ]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>
        <ExampleComment actions={[myCollapse]}/>

    </>
);