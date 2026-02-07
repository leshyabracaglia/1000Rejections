import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Counter } from '../../components/Counter';

describe('Counter', () => {
  it('renders the count', () => {
    render(<Counter count={42} />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders the "Total Rejections" label', () => {
    render(<Counter count={42} />);
    expect(screen.getByText('Total Rejections')).toBeTruthy();
  });

  it('renders zero count', () => {
    render(<Counter count={0} />);
    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('Total Rejections')).toBeTruthy();
  });

  it('renders large counts', () => {
    render(<Counter count={1500} />);
    expect(screen.getByText('1500')).toBeTruthy();
  });

  it('does not render goal or percentage text', () => {
    render(<Counter count={42} />);
    expect(screen.queryByText(/1000/)).toBeNull();
    expect(screen.queryByText(/complete/)).toBeNull();
    expect(screen.queryByText(/\//)).toBeNull();
  });
});
