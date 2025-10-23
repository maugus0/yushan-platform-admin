import { Button, Space, Dropdown, Popconfirm, Tooltip } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  CopyOutlined,
  ExportOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';

const ActionButtons = ({
  record,
  onEdit,
  onDelete,
  onView,
  onCopy,
  onExport,
  onShare,
  onDownload,
  onPrint,
  showEdit = true,
  showDelete = true,
  showView = true,
  showMore = false,
  deleteConfirmTitle = 'Are you sure you want to delete this item?',
  deleteConfirmDescription = 'This action cannot be undone.',
  size = 'small',
  type = 'text',
  customActions = [],
  ...props
}) => {
  const moreActions = [
    ...(onCopy
      ? [
          {
            key: 'copy',
            icon: <CopyOutlined />,
            label: 'Copy',
            onClick: () => onCopy(record),
          },
        ]
      : []),
    ...(onExport
      ? [
          {
            key: 'export',
            icon: <ExportOutlined />,
            label: 'Export',
            onClick: () => onExport(record),
          },
        ]
      : []),
    ...(onShare
      ? [
          {
            key: 'share',
            icon: <ShareAltOutlined />,
            label: 'Share',
            onClick: () => onShare(record),
          },
        ]
      : []),
    ...(onDownload
      ? [
          {
            key: 'download',
            icon: <DownloadOutlined />,
            label: 'Download',
            onClick: () => onDownload(record),
          },
        ]
      : []),
    ...(onPrint
      ? [
          {
            key: 'print',
            icon: <PrinterOutlined />,
            label: 'Print',
            onClick: () => onPrint(record),
          },
        ]
      : []),
    ...customActions.map((action) => ({
      ...action,
      onClick: () => action.onClick(record),
    })),
  ];

  return (
    <Space size="small" {...props}>
      {showView && onView && (
        <Tooltip title="View">
          <Button
            type={type}
            size={size}
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
          />
        </Tooltip>
      )}

      {showEdit && onEdit && (
        <Tooltip title="Edit">
          <Button
            type={type}
            size={size}
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
      )}

      {showDelete && onDelete && (
        <Popconfirm
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          onConfirm={() => onDelete(record)}
          okText="Yes"
          cancelText="No"
          okType="danger"
        >
          <Tooltip title="Delete">
            <Button type={type} size={size} icon={<DeleteOutlined />} danger />
          </Tooltip>
        </Popconfirm>
      )}

      {showMore && moreActions.length > 0 && (
        <Dropdown menu={{ items: moreActions }} placement="bottomRight" arrow>
          <Button type={type} size={size} icon={<MoreOutlined />} />
        </Dropdown>
      )}
    </Space>
  );
};

export default ActionButtons;
