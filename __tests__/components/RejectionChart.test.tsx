import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RejectionChart } from '../../components/RejectionChart';
import { MultiLineChartData } from '../../lib/chartUtils';

describe('RejectionChart', () => {
  const sampleData: MultiLineChartData = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    rejections: [3, 7, 2, 5, 10, 4],
    acceptances: [1, 2, 0, 1, 3, 1],
    pending: [2, 1, 3, 0, 1, 2],
  };

  it('renders the chart title', () => {
    render(<RejectionChart data={sampleData} />);
    expect(screen.getByText('Rejection Progress')).toBeTruthy();
  });

  it('renders nothing when all data is zero', () => {
    const emptyData: MultiLineChartData = {
      labels: ['Jan', 'Feb'],
      rejections: [0, 0],
      acceptances: [0, 0],
      pending: [0, 0],
    };
    const { toJSON } = render(<RejectionChart data={emptyData} />);
    expect(toJSON()).toBeNull();
  });

  it('renders when only rejections have data', () => {
    const data: MultiLineChartData = {
      labels: ['Jan', 'Feb'],
      rejections: [5, 3],
      acceptances: [0, 0],
      pending: [0, 0],
    };
    render(<RejectionChart data={data} />);
    expect(screen.getByText('Rejection Progress')).toBeTruthy();
  });

  it('handles a single data point', () => {
    const data: MultiLineChartData = {
      labels: ['Jan'],
      rejections: [5],
      acceptances: [1],
      pending: [0],
    };
    render(<RejectionChart data={data} />);
    expect(screen.getByText('Rejection Progress')).toBeTruthy();
  });

  describe('y-axis segments', () => {
    it('floors segments at 2 when the max value is 1, avoiding chart-kit\'s broken segments=1 case', () => {
      const data: MultiLineChartData = {
        labels: ['Jan', 'Feb'],
        rejections: [1, 0],
        acceptances: [0, 0],
        pending: [0, 0],
      };
      render(<RejectionChart data={data} />);
      // react-native-chart-kit renders a single mislabeled tick when
      // segments === 1 (see AbstractChart.renderHorizontalLabels), so this
      // must never be 1 even though the max data value is 1.
      expect(screen.getByTestId('line-chart').props.segments).toBe(2);
    });

    it('caps segments at the max value when it is between 2 and 4, so labels stay whole numbers', () => {
      const data: MultiLineChartData = {
        labels: ['Jan', 'Feb'],
        rejections: [3, 2],
        acceptances: [0, 0],
        pending: [0, 0],
      };
      render(<RejectionChart data={data} />);
      expect(screen.getByTestId('line-chart').props.segments).toBe(3);
    });

    it('uses the default 4 segments once the max value reaches 4', () => {
      const data: MultiLineChartData = {
        labels: ['Jan', 'Feb'],
        rejections: [4, 2],
        acceptances: [0, 0],
        pending: [0, 0],
      };
      render(<RejectionChart data={data} />);
      expect(screen.getByTestId('line-chart').props.segments).toBe(4);
    });

    it('uses the default 4 segments when the max value exceeds 4', () => {
      render(<RejectionChart data={sampleData} />);
      expect(screen.getByTestId('line-chart').props.segments).toBe(4);
    });
  });

  describe('formatYLabel', () => {
    it('hides an earlier duplicate but keeps the last (topmost) occurrence, e.g. max=1 producing "0", "1", "1"', () => {
      const data: MultiLineChartData = {
        labels: ['Jan', 'Feb'],
        rejections: [1, 0],
        acceptances: [0, 0],
        pending: [0, 0],
      };
      render(<RejectionChart data={data} />);
      const { formatYLabel } = screen.getByTestId('line-chart').props;

      // react-native-chart-kit calls this once per label, in order, bottom
      // to top -- for segments=2 fromZero max=1, the raw rounded sequence is
      // "0", "1", "1" (the middle 0.5 rounds up to "1" too). The top ("1")
      // is exact and is where the data line actually reaches, so it must
      // stay visible; the earlier, merely-coincidental "1" is the one to hide.
      expect(formatYLabel('0')).toBe('0');
      expect(formatYLabel('1')).toBe('');
      expect(formatYLabel('1')).toBe('1');
    });

    it('does not hide distinct consecutive labels', () => {
      render(<RejectionChart data={sampleData} />);
      const { formatYLabel } = screen.getByTestId('line-chart').props;

      expect(formatYLabel('0')).toBe('0');
      expect(formatYLabel('3')).toBe('3');
      expect(formatYLabel('5')).toBe('5');
    });
  });
});
