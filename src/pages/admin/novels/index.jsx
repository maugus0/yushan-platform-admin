import { useState, useEffect, useCallback } from 'react';
import { Space, Table, Badge, Rate, message, Row, Col, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  EyeOutlined,
  FileTextOutlined,
  TagsOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  PageHeader,
  SearchBar,
  FilterPanel,
  StatusBadge,
  EmptyState,
  LoadingSpinner,
} from '../../../components/admin/common';
import { LineChart, PieChart } from '../../../components/admin/charts';
import { novelService } from '../../../services/admin/novelservice';
import { categoryService } from '../../../services/admin/categoryservice';
import defaultNovelImage from '../../../assets/images/novel_default.png';

const Novels = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [chartLoading, setChartLoading] = useState(true);
  const [novelTrends, setNovelTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories({
        includeInactive: false,
      });
      if (response.success) {
        // Transform categories to the format needed for dropdowns
        const categoryOptions = response.data.map((cat) => ({
          value: cat.id,
          label: cat.name,
        }));
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch chart data - using hardcoded mock data
  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      // Use hardcoded mock data for novel trends (endpoint doesn't exist)
      const mockNovelTrends = [
        {
          date: '2025-09-26',
          periodLabel: '2025-09-26',
          count: 1,
          growthRate: 0.0,
        },
        {
          date: '2025-09-27',
          periodLabel: '2025-09-27',
          count: 3,
          growthRate: 200.0,
        },
        {
          date: '2025-09-28',
          periodLabel: '2025-09-28',
          count: 3,
          growthRate: 0.0,
        },
        {
          date: '2025-09-29',
          periodLabel: '2025-09-29',
          count: 3,
          growthRate: 0.0,
        },
        {
          date: '2025-09-30',
          periodLabel: '2025-09-30',
          count: 2,
          growthRate: -33.33,
        },
        {
          date: '2025-10-01',
          periodLabel: '2025-10-01',
          count: 6,
          growthRate: 200.0,
        },
        {
          date: '2025-10-02',
          periodLabel: '2025-10-02',
          count: 1,
          growthRate: -83.33,
        },
        {
          date: '2025-10-03',
          periodLabel: '2025-10-03',
          count: 4,
          growthRate: 300.0,
        },
        {
          date: '2025-10-04',
          periodLabel: '2025-10-04',
          count: 3,
          growthRate: -25.0,
        },
        {
          date: '2025-10-05',
          periodLabel: '2025-10-05',
          count: 5,
          growthRate: 66.67,
        },
        {
          date: '2025-10-06',
          periodLabel: '2025-10-06',
          count: 6,
          growthRate: 20.0,
        },
        {
          date: '2025-10-07',
          periodLabel: '2025-10-07',
          count: 2,
          growthRate: -66.67,
        },
        {
          date: '2025-10-08',
          periodLabel: '2025-10-08',
          count: 5,
          growthRate: 150.0,
        },
        {
          date: '2025-10-09',
          periodLabel: '2025-10-09',
          count: 2,
          growthRate: -60.0,
        },
        {
          date: '2025-10-10',
          periodLabel: '2025-10-10',
          count: 5,
          growthRate: 150.0,
        },
        {
          date: '2025-10-11',
          periodLabel: '2025-10-11',
          count: 2,
          growthRate: -60.0,
        },
        {
          date: '2025-10-12',
          periodLabel: '2025-10-12',
          count: 2,
          growthRate: 0.0,
        },
        {
          date: '2025-10-13',
          periodLabel: '2025-10-13',
          count: 2,
          growthRate: 0.0,
        },
        {
          date: '2025-10-14',
          periodLabel: '2025-10-14',
          count: 5,
          growthRate: 150.0,
        },
        {
          date: '2025-10-15',
          periodLabel: '2025-10-15',
          count: 4,
          growthRate: -20.0,
        },
        {
          date: '2025-10-16',
          periodLabel: '2025-10-16',
          count: 4,
          growthRate: 0.0,
        },
        {
          date: '2025-10-17',
          periodLabel: '2025-10-17',
          count: 2,
          growthRate: -50.0,
        },
        {
          date: '2025-10-18',
          periodLabel: '2025-10-18',
          count: 3,
          growthRate: 50.0,
        },
        {
          date: '2025-10-19',
          periodLabel: '2025-10-19',
          count: 5,
          growthRate: 66.67,
        },
        {
          date: '2025-10-20',
          periodLabel: '2025-10-20',
          count: 5,
          growthRate: 0.0,
        },
        {
          date: '2025-10-21',
          periodLabel: '2025-10-21',
          count: 4,
          growthRate: -20.0,
        },
        {
          date: '2025-10-22',
          periodLabel: '2025-10-22',
          count: 1,
          growthRate: -75.0,
        },
        {
          date: '2025-10-23',
          periodLabel: '2025-10-23',
          count: 5,
          growthRate: 400.0,
        },
        {
          date: '2025-10-24',
          periodLabel: '2025-10-24',
          count: 5,
          growthRate: 0.0,
        },
        {
          date: '2025-10-25',
          periodLabel: '2025-10-25',
          count: 4,
          growthRate: -20.0,
        },
      ];
      setNovelTrends(mockNovelTrends);

      // Use hardcoded mock data for categories
      const mockCategories = [
        { name: 'Fantasy', value: 7, percentage: 20.0 },
        { name: 'Martial Arts', value: 6, percentage: 17.1 },
        { name: 'Wuxia', value: 8, percentage: 22.9 },
        { name: 'Adventure', value: 7, percentage: 20.0 },
        { name: 'Sci-Fi', value: 7, percentage: 20.0 },
      ];
      setCategoryData(mockCategories);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Fetch data
  const fetchData = useCallback(
    async (params = {}) => {
      setLoading(true);
      try {
        const currentPage = params.current || 1;
        const currentPageSize = params.pageSize || 10;

        const response = await novelService.getAllNovels({
          page: currentPage - 1, // Convert to 0-indexed
          size: currentPageSize,
          search: searchValue,
          sort: params.sortBy || 'createTime',
          order: params.sortOrder || 'desc',
          category: filters.category || '',
          status: filters.status || '',
          authorName: filters.authorName || '',
          authorId: filters.authorId || '',
        });

        setData(response.data);
        setPagination((prev) => ({
          ...prev,
          current: response.page,
          total: response.total,
          pageSize: response.pageSize,
        }));
      } catch (error) {
        console.error('Failed to fetch novels:', error);
        message.error('Failed to fetch novels');
      } finally {
        setLoading(false);
      }
    },
    [searchValue, filters]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter configuration - using dynamic categories
  const filterConfig = [
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'UNDER_REVIEW', label: 'Under Review' },
        { value: 'PUBLISHED', label: 'Published' },
        { value: 'ARCHIVED', label: 'Archived' },
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: categories, // Use dynamic categories from API
    },
    {
      name: 'authorName',
      label: 'Author Name',
      type: 'text',
      placeholder: 'Search by author name...',
    },
    {
      name: 'authorId',
      label: 'Author ID',
      type: 'text',
      placeholder: 'Enter author ID...',
    },
  ];

  // Table columns
  const columns = [
    {
      title: 'Novel',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text, record) => (
        <Space>
          <img
            src={
              record.coverImgUrl && record.coverImgUrl.startsWith('data:image')
                ? record.coverImgUrl
                : defaultNovelImage
            }
            alt={text || 'Novel'}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultNovelImage;
            }}
            style={{
              width: 40,
              height: 60,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #f0f0f0',
            }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {text || 'Untitled'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <UserOutlined style={{ marginRight: 4 }} />
              by {record.authorUsername || 'Unknown'}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              ID: {record.authorId ? record.authorId.substring(0, 8) : 'N/A'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        // Map API status to StatusBadge format
        const statusMap = {
          DRAFT: 'draft',
          UNDER_REVIEW: 'reviewing',
          PUBLISHED: 'published',
          ARCHIVED: 'suspended',
        };
        return <StatusBadge status={statusMap[status] || 'draft'} />;
      },
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 120,
      render: (category) => (
        <Space>
          <TagsOutlined />
          {category || 'Uncategorized'}
        </Space>
      ),
    },
    {
      title: 'Stats',
      key: 'stats',
      width: 220,
      render: (_, record) => (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: '12px' }}>
              <FileTextOutlined style={{ marginRight: 4 }} />
              {record.chapterCnt || 0} chapters
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: '12px' }}>
              <EyeOutlined style={{ marginRight: 4 }} />
              {(record.viewCnt || 0).toLocaleString()} views
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: '12px' }}>
              📝 {(record.wordCnt || 0).toLocaleString()} words
            </span>
          </div>
          <div>
            <Rate
              disabled
              value={parseFloat(record.avgRating || 0)}
              size="small"
            />
            <span style={{ fontSize: '11px', color: '#666', marginLeft: 4 }}>
              ({record.avgRating ? record.avgRating.toFixed(2) : '0.00'})
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Engagement',
      key: 'engagement',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            <span style={{ color: '#1890ff' }}>
              {(record.voteCnt || 0).toLocaleString()}
            </span>{' '}
            votes
          </div>
          <div style={{ fontSize: '12px', marginBottom: 2 }}>
            <span style={{ color: '#52c41a' }}>
              {(record.reviewCnt || 0).toLocaleString()}
            </span>{' '}
            reviews
          </div>
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#fa8c16' }}>
              {record.isCompleted ? '✅ Complete' : '📝 Ongoing'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'yuanCnt',
      key: 'yuanCnt',
      width: 120,
      render: (yuanCnt) => (
        <div>
          {(yuanCnt || 0) > 0 ? (
            <div>
              <Badge color="gold" text="Premium" style={{ marginBottom: 4 }} />
              <div
                style={{ fontSize: '12px', fontWeight: 500, color: '#52c41a' }}
              >
                ¥{(yuanCnt || 0).toFixed(2)}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>Free</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '11px', marginBottom: 4 }}>
            <div style={{ color: '#666' }}>Created:</div>
            <div>{new Date(record.createTime).toLocaleDateString()}</div>
          </div>
          <div style={{ fontSize: '11px' }}>
            <div style={{ color: '#666' }}>Updated:</div>
            <div>{new Date(record.updateTime).toLocaleDateString()}</div>
          </div>
          {record.publishTime && (
            <div style={{ fontSize: '11px', marginTop: 4 }}>
              <div style={{ color: '#666' }}>Published:</div>
              <div>{new Date(record.publishTime).toLocaleDateString()}</div>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Handlers
  const handleSearch = (value) => {
    setSearchValue(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      category: categoryId === 'all' ? '' : categoryId,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilter = (filterValues) => {
    setFilters(filterValues);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchValue('');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo);
  };

  // Transform data for charts
  const novelGrowthData = novelTrends.map((point) => ({
    name: point.periodLabel,
    novels: point.count,
    date: point.date,
  }));

  return (
    <div>
      <PageHeader
        title="Novels Management"
        subtitle="Manage and monitor novels on the platform"
        breadcrumbs={[
          { title: 'Dashboard', href: '/yushan-admin/admin/dashboard' },
          { title: 'Novels' },
        ]}
        actions={[
          <Button
            key="review"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => navigate('/admin/novels/review')}
          >
            Review Novels
          </Button>,
          <Button
            key="moderate"
            icon={<FileSearchOutlined />}
            onClick={() => navigate('/admin/novels/moderate')}
          >
            Moderate Novels
          </Button>,
        ]}
      />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Charts Row - Novel Creation Trend and Categories */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            {chartLoading ? (
              <LoadingSpinner tip="Loading chart..." />
            ) : (
              <LineChart
                title="Novel Creation Trend"
                subtitle="New novels over time"
                data={novelGrowthData}
                lines={[
                  { dataKey: 'novels', stroke: '#52c41a', name: 'New Novels' },
                ]}
                height={350}
              />
            )}
          </Col>

          <Col xs={24} lg={12}>
            {chartLoading ? (
              <LoadingSpinner tip="Loading chart..." />
            ) : (
              <PieChart
                title="Novel Categories"
                subtitle="Distribution by genre"
                data={categoryData}
                height={350}
              />
            )}
          </Col>
        </Row>

        <SearchBar
          placeholder="Search novels by title, author, or description..."
          onSearch={handleSearch}
          onClear={() => setSearchValue('')}
          searchValue={searchValue}
          showFilter={false}
          showCategoryFilter={true}
          categories={categories} // Use dynamic categories from API
          selectedCategory={filters.category || 'all'}
          onCategoryChange={handleCategoryChange}
          loading={loading}
        />

        <FilterPanel
          filters={filterConfig}
          onFilter={handleFilter}
          onClear={handleClearFilters}
          collapsed={true}
          showToggle={true}
        />

        {loading ? (
          <LoadingSpinner tip="Loading novels..." />
        ) : data.length === 0 ? (
          <EmptyState
            type="novels"
            title="No Novels Found"
            description="No novels match your current search and filter criteria."
            actions={[
              {
                children: 'Clear Filters',
                onClick: handleClearFilters,
              },
            ]}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} novels`,
            }}
            onChange={handleTableChange}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        )}
      </Space>
    </div>
  );
};

export default Novels;
