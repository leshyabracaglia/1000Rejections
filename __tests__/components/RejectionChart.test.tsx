import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RejectionChart } from '../../components/RejectionChart';

describe('RejectionChart', () => {
  const sampleData = [
    { label: 'Sep', count: 3 },
    { label: 'Oct', count: 7 },
    { label: 'Nov', count: 2 },
    { label: 'Dec', count: 5 },
    { label: 'Jan', count: 10 },
    { label: 'Feb', count: 4 },
  ];

  it('renders the chart title', () => {
    render(<RejectionChart data={sampleData} />);
    expect(screen.getByText('Rejections Over Time')).toBeTruthy();
  });

  it('renders the LineChart', () => {
    render(<RejectionChart data={sampleData} />);
    expect(screen.getByTestId('line-chart')).toBeTruthy();
  });

  it('renders nothing when data is empty', () => {
    const { toJSON } = render(<RejectionChart data={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('handles all-zero data without crashing', () => {
    const zeroData = [
      { label: 'Jan', count: 0 },
      { label: 'Feb', count: 0 },
    ];
    render(<RejectionChart data={zeroData} />);
    expect(screen.getByText('Rejections Over Time')).toBeTruthy();
  });

  it('handles a single data point', () => {
    render(<RejectionChart data={[{ label: 'Jan', count: 5 }]} />);
    expect(screen.getByText('Rejections Over Time')).toBeTruthy();
    expect(screen.getByTestId('line-chart')).toBeTruthy();
  });
});
