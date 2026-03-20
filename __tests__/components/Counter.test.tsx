import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Counter } from '../../components/Counter';

const defaultProps = { total: 0, pending: 0, rejected: 0, accepted: 0, streak: 0 };

describe('Counter', () => {
  it('renders the count', () => {
    render(<Counter {...defaultProps} rejected={42} />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders the "Rejections" label', () => {
    render(<Counter {...defaultProps} rejected={42} />);
    expect(screen.getByText('Rejections')).toBeTruthy();
  });

  it('renders zero count', () => {
    render(<Counter {...defaultProps} rejected={0} />);
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('Rejections')).toBeTruthy();
  });

  it('renders large counts', () => {
    render(<Counter {...defaultProps} rejected={1500} />);
    expect(screen.getByText('1500')).toBeTruthy();
  });

  it('renders singular Rejection label for count of 1', () => {
    render(<Counter {...defaultProps} rejected={1} />);
    expect(screen.getByText('Rejection')).toBeTruthy();
  });
});
