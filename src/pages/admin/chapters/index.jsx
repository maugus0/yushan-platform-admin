import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Space,
  Table,
  Tooltip,
  Progress,
  Row,
  Col,
  Grid,
  Card,
  Divider,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  SearchBar,
  StatusBadge,
  ActionButtons,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import { novelService } from '../../../services/admin/novelservice';
import { chapterService } from '../../../services/admin/chapterservice';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const Chapters = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [allChapters, setAllChapters] = useState([]);
  const [filters, setFilters] = useState({});
  // Novels and selected novel for fetching chapters
  const [novels, setNovels] = useState([]);
  const [selectedNovel, setSelectedNovel] = useState(null);
  const screens = useBreakpoint();

  // Fetch data
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const novelToUse = params.novel || selectedNovel;
        if (!novelToUse) {
          setData([]);
          setAllChapters([]);
          setPagination((prev) => ({ ...prev, total: 0 }));
          return;
        }

        // Always fetch chapters for the selected novel
        const resp = await chapterService.getChaptersByNovel(novelToUse.id, {
          page: params.current || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
          publishedOnly: false, // show all chapters
        });

        // Map BE fields to FE for table (robust mapping)
        const chapters = (resp.data || []).map((ch) => ({
          uuid: ch.uuid,
          id: ch.chapterId || ch.id || ch.uuid, // fallback for AntD
          chapterNumber: ch.chapterNumber,
          title: ch.title,
          wordCount: ch.wordCount ?? ch.wordCnt ?? 0,
          views: ch.views ?? ch.viewCnt ?? 0,
          publishedAt: ch.publishedAt ?? ch.publishTime ?? null,
          novel: novelToUse.title,
          author: novelToUse.authorUsername || novelToUse.author || '',
          status: ch.status || (ch.isPremium ? 'published' : 'draft'),
          readingTime:
            (ch.wordCount ?? ch.wordCnt)
              ? Math.ceil((ch.wordCount ?? ch.wordCnt) / 200)
              : 0,
        }));

        setAllChapters(chapters);
        // Apply client-side search if searchValue is set
        let filtered = chapters;
        if (searchValue) {
          const q = searchValue.toLowerCase();
          filtered = chapters.filter(
            (ch) =>
              (ch.title && ch.title.toLowerCase().includes(q)) ||
              (ch.novel && ch.novel.toLowerCase().includes(q)) ||
              (ch.author && ch.author.toLowerCase().includes(q))
          );
        }
        setData(filtered);
        setPagination((prev) => ({
          ...prev,
          current: resp.page || params.current || prev.current,
          total: filtered.length,
          pageSize: resp.pageSize || prev.pageSize,
        }));
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
      } finally {
        setLoading(false);
      }
    },
    [selectedNovel, searchValue, pagination]
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, filters]);

  // Fetch novels list for selection
  useEffect(() => {
    (async () => {
      try {
        const resp = await novelService.getAllNovels({ page: 0, size: 200 });
        if (resp && resp.data) {
          setNovels(resp.data);
          // Do not select first novel by default
        }
      } catch (err) {
        console.error('Failed to fetch novels:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When selectedNovel changes, load chapters for it
  useEffect(() => {
    if (selectedNovel) {
      fetchData({ current: 1, pageSize: pagination.pageSize });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNovel]);

  // Table columns
  const columns = [
    {
      title: 'Chapter',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <div style={{ fontWeight: 500 }}>{text}</div>
          </Space>
          <div style={{ fontSize: '12px', color: '#666', marginLeft: 20 }}>
            <BookOutlined style={{ marginRight: 4 }} />
            {record.novel} - Chapter {record.chapterNumber}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginLeft: 20 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            by {record.author}
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Word Count',
      dataIndex: 'wordCount',
      key: 'wordCount',
      render: (count) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{count.toLocaleString()}</div>
          <Progress
            percent={Math.min((count / 3000) * 100, 100)}
            showInfo={false}
            size="small"
            strokeColor={
              count >= 3000 ? '#52c41a' : count >= 2000 ? '#faad14' : '#ff4d4f'
            }
          />
        </Space>
      ),
    },
    {
      title: 'Reading Time',
      dataIndex: 'readingTime',
      key: 'readingTime',
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          {time} min
        </Space>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      render: (views) => (
        <Space>
          <EyeOutlined />
          {views.toLocaleString()}
        </Space>
      ),
    },
    {
      title: 'Published',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date) =>
        date ? (
          <Tooltip title={new Date(date).toLocaleString()}>
            <Space>
              <CalendarOutlined />
              {new Date(date).toLocaleDateString()}
            </Space>
          </Tooltip>
        ) : (
          <span style={{ color: '#999' }}>Not published</span>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onDelete={handleDelete}
          showEdit={false}
          showView={false}
          showMore={false}
        />
      ),
    },
  ];

  // Handlers
  const handleSearch = (value) => {
    setSearchValue(value);
    // Client-side search: filter allChapters
    if (!value) {
      setData(allChapters);
      setPagination((prev) => ({ ...prev, total: allChapters.length }));
    } else {
      const q = value.toLowerCase();
      const filtered = allChapters.filter(
        (ch) =>
          (ch.title && ch.title.toLowerCase().includes(q)) ||
          (ch.novel && ch.novel.toLowerCase().includes(q)) ||
          (ch.author && ch.author.toLowerCase().includes(q))
      );
      setData(filtered);
      setPagination((prev) => ({ ...prev, total: filtered.length }));
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
  };

  const handleDelete = (record) => {
    // Delete a single chapter via API
    (async () => {
      try {
        setLoading(true);
        const resp = await chapterService.deleteChapter(
          record.uuid || record.id
        );
        if (resp.success) {
          // refresh list
          fetchData({
            current: pagination.current,
            pageSize: pagination.pageSize,
          });
        }
      } catch (err) {
        console.error('Failed to delete chapter:', err);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleView = (record) => {
    console.log('View chapter:', record);
  };

  const handleEdit = (record) => {
    console.log('Edit chapter:', record);
  };

  const handleAddNew = () => {
    console.log('Add new chapter');
  };

  const handleDeleteAll = async () => {
    if (!selectedNovel) return;
    try {
      setLoading(true);
      const resp = await chapterService.deleteChaptersByNovel(selectedNovel.id);
      if (resp.success) {
        // refresh
        fetchData({ current: 1, pageSize: pagination.pageSize });
      }
    } catch (err) {
      console.error('Failed to delete all chapters for novel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo);
  };

  return (
    <div>
      <PageHeader
        title="Chapters Management"
        subtitle="Manage and monitor novel chapters"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Chapters' },
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24}>
            <div style={{ width: '100%', marginBottom: 12 }}>
              <label
                htmlFor="novel-select"
                style={{ marginRight: 8, fontWeight: 500 }}
              >
                Novel:
              </label>
              <select
                id="novel-select"
                value={selectedNovel ? selectedNovel.id : ''}
                onChange={(e) => {
                  const novel = novels.find(
                    (n) => String(n.id) === e.target.value
                  );
                  setSelectedNovel(novel || null);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 4,
                  fontSize: 16,
                  marginTop: 4,
                }}
                disabled={novels.length === 0}
              >
                <option value="">Select a novel...</option>
                {novels.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
              </select>
            </div>
          </Col>
          <Col xs={24} sm={24}>
            <SearchBar
              placeholder="Search chapters by title, novel, or author..."
              onSearch={handleSearch}
              onClear={() => setSearchValue('')}
              searchValue={searchValue}
              showFilter={false}
              loading={loading}
            />
          </Col>
        </Row>

        {loading ? (
          <LoadingSpinner tip="Loading chapters..." />
        ) : data.length === 0 ? (
          <EmptyState
            title={!selectedNovel ? 'Select a Novel' : 'No Chapters Found'}
            description={
              !selectedNovel
                ? 'Please select a novel from the dropdown above to view its chapters.'
                : 'No chapters match your current search and filter criteria.'
            }
            onDefaultAction={!selectedNovel ? undefined : handleAddNew}
            defaultActionText={!selectedNovel ? undefined : 'Add First Chapter'}
            actions={
              !selectedNovel
                ? []
                : [
                    {
                      children: 'Clear Filters',
                      onClick: handleClearFilters,
                    },
                  ]
            }
          />
        ) : (
          <>
            <Row style={{ marginBottom: 16 }}>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={8}
                xl={6}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <Button
                  danger
                  size="small"
                  onClick={handleDeleteAll}
                  disabled={!selectedNovel || data.length === 0}
                >
                  Delete All Chapters
                </Button>
              </Col>
            </Row>

            {(screens?.md ?? true) ? (
              // Desktop view - Table
              <Table
                columns={columns}
                dataSource={data}
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} chapters`,
                }}
                onChange={handleTableChange}
                loading={loading}
                rowKey="uuid"
                scroll={{ x: 1100 }}
              />
            ) : (
              // Mobile view - Card
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="small"
              >
                {data.map((chapter) => (
                  <Card key={chapter.uuid} style={{ marginBottom: 8 }}>
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size="small"
                    >
                      <div>
                        <Text strong style={{ fontSize: '14px' }}>
                          {chapter.title}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <BookOutlined style={{ marginRight: 4 }} />
                          Ch. {chapter.chapterNumber}
                        </Text>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div>
                        <Row gutter={12}>
                          <Col xs={12}>
                            <Space direction="vertical" size={0}>
                              <Text
                                type="secondary"
                                style={{ fontSize: '11px' }}
                              >
                                Status
                              </Text>
                              <StatusBadge status={chapter.status} />
                            </Space>
                          </Col>
                          <Col xs={12}>
                            <Space direction="vertical" size={0}>
                              <Text
                                type="secondary"
                                style={{ fontSize: '11px' }}
                              >
                                <EyeOutlined style={{ marginRight: 4 }} />
                                Views
                              </Text>
                              <Text strong style={{ fontSize: '12px' }}>
                                {chapter.views || 0}
                              </Text>
                            </Space>
                          </Col>
                        </Row>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div>
                        <Space
                          direction="vertical"
                          size={0}
                          style={{ width: '100%' }}
                        >
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            Progress
                          </Text>
                          <Progress
                            percent={chapter.progress || 0}
                            size="small"
                            format={(percent) => `${percent}%`}
                          />
                        </Space>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div>
                        <Space
                          direction="vertical"
                          size={2}
                          style={{ width: '100%', fontSize: '11px' }}
                        >
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            {new Date(chapter.createdAt).toLocaleDateString()}
                          </Text>
                          {chapter.updatedAt && (
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              Updated:{' '}
                              {new Date(chapter.updatedAt).toLocaleDateString()}
                            </Text>
                          )}
                        </Space>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div
                        style={{ display: 'flex', justifyContent: 'flex-end' }}
                      >
                        <ActionButtons
                          record={chapter}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          showMore={true}
                        />
                      </div>
                    </Space>
                  </Card>
                ))}
                {/* Mobile Pagination */}
                <Space
                  direction="vertical"
                  style={{ width: '100%', marginTop: 16, textAlign: 'center' }}
                >
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {pagination.current} of{' '}
                    {Math.ceil(pagination.total / pagination.pageSize)} pages
                  </Text>
                  <Space justify="center" wrap>
                    <Button
                      size="small"
                      disabled={pagination.current === 1}
                      onClick={() =>
                        handleTableChange(
                          {
                            current: pagination.current - 1,
                            pageSize: pagination.pageSize,
                          },
                          {},
                          {}
                        )
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      disabled={
                        pagination.current >=
                        Math.ceil(pagination.total / pagination.pageSize)
                      }
                      onClick={() =>
                        handleTableChange(
                          {
                            current: pagination.current + 1,
                            pageSize: pagination.pageSize,
                          },
                          {},
                          {}
                        )
                      }
                    >
                      Next
                    </Button>
                  </Space>
                </Space>
              </Space>
            )}
          </>
        )}
      </Space>
    </div>
  );
};

export default Chapters;
