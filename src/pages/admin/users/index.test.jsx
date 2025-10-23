import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock dependent components and services before importing the component
jest.mock('../../../components/admin/common/pageheader', () => {
  const MockPageHeader = (props) => (
    <div data-testid="page-header">{props.title}</div>
  );
  MockPageHeader.displayName = 'MockPageHeader';
  return MockPageHeader;
});
jest.mock('../../../components/admin/common/breadcrumbs', () => {
  const MockBreadcrumbs = (props) => (
    <div data-testid="breadcrumbs">
      {props.items?.map((i) => i.title).join(',')}
    </div>
  );
  MockBreadcrumbs.displayName = 'MockBreadcrumbs';
  return MockBreadcrumbs;
});
jest.mock('../../../components/admin/charts', () => ({
  BarChart: (props) => (
    <div data-testid="bar-chart">{props.data?.length || 0}</div>
  ),
}));

jest.mock('../../../services/admin/userservice', () => ({
  userService: {
    getReaders: jest.fn(),
    getWriters: jest.fn(),
  },
}));

jest.mock('../../../services/admin/analyticsservice', () => ({
  getPlatformDAU: jest.fn(),
}));

jest.mock('../../../services/admin/rankingservice', () => ({
  getUserRankings: jest.fn(),
  getAuthorRankings: jest.fn(),
}));

import { userService } from '../../../services/admin/userservice';
import analyticsService from '../../../services/admin/analyticsservice';
import rankingService from '../../../services/admin/rankingservice';
import UsersOverview from './index';

const mockReadersShort = {
  data: [{ id: 1, username: 'reader1', joinDate: '2024-01-01' }],
  total: 1,
};
const mockWritersShort = {
  data: [{ id: 2, username: 'writer1', joinDate: '2024-02-01' }],
  total: 1,
};
const mockReadersAll = {
  data: [{ id: 1, username: 'reader1', status: 'active' }],
  total: 1,
};
const mockWritersAll = {
  data: [{ id: 2, username: 'writer1', status: 'active' }],
  total: 1,
};

describe('UsersOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userService.getReaders.mockResolvedValue(mockReadersShort);
    userService.getWriters.mockResolvedValue(mockWritersShort);
    // For the additional calls that fetch all readers/writers
    userService.getReaders
      .mockResolvedValueOnce(mockReadersShort)
      .mockResolvedValueOnce(mockReadersAll);
    userService.getWriters
      .mockResolvedValueOnce(mockWritersShort)
      .mockResolvedValueOnce(mockWritersAll);

    analyticsService.getPlatformDAU.mockResolvedValue({
      success: true,
      data: { dau: 10, wau: 20, mau: 30, hourlyBreakdown: [] },
    });
    rankingService.getUserRankings.mockResolvedValue({
      success: true,
      data: { content: [] },
    });
    rankingService.getAuthorRankings.mockResolvedValue({
      success: true,
      data: { content: [] },
    });
  });

  test('renders header, breadcrumbs and fetches overview data', async () => {
    render(
      <BrowserRouter>
        <UsersOverview />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    // Services should be called to fetch readers/writers and analytics/rankings
    expect(userService.getReaders).toHaveBeenCalled();
    expect(userService.getWriters).toHaveBeenCalled();
    expect(analyticsService.getPlatformDAU).toHaveBeenCalled();
    expect(rankingService.getUserRankings).toHaveBeenCalled();
    expect(rankingService.getAuthorRankings).toHaveBeenCalled();

    // BarChart should be rendered (we mock it to have a data-testid)
    await waitFor(() =>
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    );
  });

  test('handles analytics missing gracefully', async () => {
    analyticsService.getPlatformDAU.mockResolvedValueOnce({ success: false });

    render(
      <BrowserRouter>
        <UsersOverview />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-header')).toBeInTheDocument();
    });

    // When analytics missing we should not render the BarChart
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });
});
