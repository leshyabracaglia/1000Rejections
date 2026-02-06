import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Counter } from '../../components/Counter';

describe('Counter', () => {
  it('renders count and default goal', () => {
    render(<Counter count={42} />);
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('1000')).toBeTruthy();
    expect(screen.getByText('rejections this year')).toBeTruthy();
  });

  it('renders custom goal', () => {
    render(<Counter count={10} goal={100} />);
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('shows correct percentage', () => {
    render(<Counter count={250} goal={1000} />);
    expect(screen.getByText('25% complete')).toBeTruthy();
  });

  it('caps progress at 100%', () => {
    render(<Counter count={1500} goal={1000} />);
    expect(screen.getByText('100% complete')).toBeTruthy();
  });

  it('shows 0% for zero count', () => {
    render(<Counter count={0} />);
    expect(screen.getByText('0% complete')).toBeTruthy();
  });
});
