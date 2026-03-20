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
});
