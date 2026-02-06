import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { RejectionCard } from '../../components/RejectionCard';
import { mockRejection } from '../helpers/index';

jest.spyOn(Alert, 'alert');

describe('RejectionCard', () => {
  const onPress = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders title and formatted date', () => {
    const rejection = mockRejection({ title: 'Job Application', date: '2025-03-15' });
    render(<RejectionCard rejection={rejection} onPress={onPress} onDelete={onDelete} />);
    expect(screen.getByText('Job Application')).toBeTruthy();
    expect(screen.getByText('Mar 15, 2025')).toBeTruthy();
  });

  it('renders description when present', () => {
    const rejection = mockRejection({ description: 'Applied to Google' });
    render(<RejectionCard rejection={rejection} onPress={onPress} onDelete={onDelete} />);
    expect(screen.getByText('Applied to Google')).toBeTruthy();
  });

  it('does not render description when null', () => {
    const rejection = mockRejection({ description: null });
    render(<RejectionCard rejection={rejection} onPress={onPress} onDelete={onDelete} />);
    expect(screen.queryByText('A test description')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const rejection = mockRejection();
    render(<RejectionCard rejection={rejection} onPress={onPress} onDelete={onDelete} />);
    fireEvent.press(screen.getByText('Test Rejection'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows delete confirmation on long press', () => {
    const rejection = mockRejection();
    render(<RejectionCard rejection={rejection} onPress={onPress} onDelete={onDelete} />);
    fireEvent(screen.getByText('Test Rejection'), 'longPress');
    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Rejection',
      'Are you sure you want to delete this rejection?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete' }),
      ])
    );
  });
});
