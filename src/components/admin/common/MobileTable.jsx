import { Table, Card, Button } from 'antd';
import { useIsMobile } from '../../../hooks/admin/useresponsive';

/**
 * Responsive table component that shows cards on mobile and table on desktop
 */
const MobileTable = ({
  columns = [],
  dataSource = [],
  cardRenderer,
  pagination,
  onChange,
  loading = false,
  rowKey = 'id',
  scroll,
  size,
  ...tableProps
}) => {
  const isMobile = useIsMobile();

  // Default card renderer if none provided
  const defaultCardRenderer = (record, index) => {
    return (
      <Card
        key={record[rowKey] || index}
        size="small"
        style={{ marginBottom: 12 }}
        bodyStyle={{ padding: 16 }}
      >
        {columns
          .filter((col) => col.dataIndex || col.key)
          .map((col, colIndex) => {
            const value = col.dataIndex
              ? record[col.dataIndex]
              : record[col.key];
            const renderedValue = col.render
              ? col.render(value, record, index)
              : value;

            return (
              <div key={colIndex} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#8c8c8c',
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  {typeof col.title === 'string' ? col.title : 'Field'}
                </div>
                <div style={{ fontSize: '14px', color: '#262626' }}>
                  {renderedValue}
                </div>
              </div>
            );
          })}
      </Card>
    );
  };

  // Mobile pagination component
  const MobilePagination = ({ pagination, onChange }) => {
    if (!pagination || pagination.total === 0) return null;

    const { current = 1, pageSize = 10, total = 0 } = pagination;
    const totalPages = Math.ceil(total / pageSize);

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
          gap: 12,
        }}
      >
        <Button
          size="small"
          disabled={current <= 1}
          onClick={() =>
            onChange && onChange({ ...pagination, current: current - 1 })
          }
        >
          Previous
        </Button>
        <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
          {current} of {totalPages}
        </span>
        <Button
          size="small"
          disabled={current >= totalPages}
          onClick={() =>
            onChange && onChange({ ...pagination, current: current + 1 })
          }
        >
          Next
        </Button>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="mobile-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
        ) : dataSource.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8c8c8c' }}>
            No data available
          </div>
        ) : (
          <>
            <div className="mobile-cards-container">
              {dataSource.map((record, index) =>
                cardRenderer
                  ? cardRenderer(record, index)
                  : defaultCardRenderer(record, index)
              )}
            </div>
            <MobilePagination pagination={pagination} onChange={onChange} />
          </>
        )}
      </div>
    );
  }

  // Desktop view - regular table
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      onChange={onChange}
      loading={loading}
      rowKey={rowKey}
      scroll={scroll}
      size={size}
      {...tableProps}
    />
  );
};

export default MobileTable;
