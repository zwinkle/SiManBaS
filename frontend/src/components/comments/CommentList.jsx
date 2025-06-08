// src/components/comments/CommentList.jsx
import React from 'react';
// Hapus 'Comment' dari impor antd
import { List, Avatar, Tooltip, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatDateTime } from '../../utils/formatters'; // Asumsi Anda punya formatter tanggal

const { Text } = Typography;

/**
 * Menampilkan daftar komentar menggunakan komponen List dari AntD v5.
 */
const CommentList = ({ comments }) => {
    return (
        <List
            className="comment-list"
            header={`${comments.length} Komentar`}
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={(item) => (
                // Gunakan List.Item, bukan <li> dan <Comment>
                <List.Item>
                    <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                            <div>
                                <a>{item.owner.full_name || item.owner.username}</a>
                                <Tooltip title={formatDateTime(item.created_at)}>
                                    <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                                        {formatDateTime(item.created_at)}
                                    </Text>
                                </Tooltip>
                            </div>
                        }
                        description={<p>{item.content}</p>}
                    />
                </List.Item>
            )}
        />
    );
};

export default CommentList;
