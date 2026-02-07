import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

const mockResetPassword = jest.fn();
const mockBack = jest.fn();

jest.mock('../../lib/auth', () => ({
  useAuth: () => ({ resetPassword: mockResetPassword }),
}));

jest.mock('expo-router', () => ({
  router: { back: (...args: any[]) => mockBack(...args) },
  Link: ({ children }: any) => children,
}));

import ForgotPasswordScreen from '../../app/(auth)/forgot-password';

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResetPassword.mockResolvedValue({ error: null });
  });

  it('renders the form with email input and submit button', () => {
    render(<ForgotPasswordScreen />);
    expect(screen.getByText('Reset Password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByText('Send Reset Link')).toBeTruthy();
  });

  it('shows error when submitting with empty email', async () => {
    render(<ForgotPasswordScreen />);
    fireEvent.press(screen.getByText('Send Reset Link'));
    await waitFor(() =>
      expect(screen.getByText('Please enter your email address')).toBeTruthy()
    );
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('calls resetPassword with trimmed email on submit', async () => {
    render(<ForgotPasswordScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), '  test@example.com  ');
    fireEvent.press(screen.getByText('Send Reset Link'));
    await waitFor(() =>
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
    );
  });

  it('shows success message after sending reset link', async () => {
    render(<ForgotPasswordScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(screen.getByText('Send Reset Link'));
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeTruthy();
      expect(screen.getByText(/test@example.com/)).toBeTruthy();
    });
    expect(screen.queryByPlaceholderText('Email')).toBeNull();
  });

  it('shows error message when resetPassword fails', async () => {
    mockResetPassword.mockResolvedValue({ error: new Error('User not found') });
    render(<ForgotPasswordScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'bad@example.com');
    fireEvent.press(screen.getByText('Send Reset Link'));
    await waitFor(() =>
      expect(screen.getByText('User not found')).toBeTruthy()
    );
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
  });

  it('navigates back when Back button is pressed', () => {
    render(<ForgotPasswordScreen />);
    fireEvent.press(screen.getByText('Back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates back from success state via Back to Sign In', async () => {
    render(<ForgotPasswordScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(screen.getByText('Send Reset Link'));
    await waitFor(() => expect(screen.getByText('Back to Sign In')).toBeTruthy());
    fireEvent.press(screen.getByText('Back to Sign In'));
    expect(mockBack).toHaveBeenCalled();
  });
});
