import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

const mockSignUp = jest.fn();
const mockReplace = jest.fn();

jest.mock('../../lib/auth', () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}));

jest.mock('expo-router', () => ({
  router: { replace: (...args: any[]) => mockReplace(...args) },
  Link: ({ children }: any) => children,
}));

jest.spyOn(Alert, 'alert');

import SignupScreen from '../../app/(auth)/signup';

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUp.mockResolvedValue({ error: null });
  });

  it('renders form with all fields and create account button', () => {
    render(<SignupScreen />);
    expect(screen.getByText('Join the Challenge')).toBeTruthy();
    expect(screen.getByText('Start collecting your 1000 rejections')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(screen.getByText('Create Account')).toBeTruthy();
  });

  it('shows sign in link', () => {
    render(<SignupScreen />);
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('shows error when submitting with empty fields', async () => {
    render(<SignupScreen />);
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(screen.getByText('Please fill in all fields')).toBeTruthy()
    );
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error when only email is filled', async () => {
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(screen.getByText('Please fill in all fields')).toBeTruthy()
    );
  });

  it('shows error when passwords do not match', async () => {
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), 'different');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(screen.getByText('Passwords do not match')).toBeTruthy()
    );
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), '12345');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), '12345');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy()
    );
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signUp with trimmed email and password', async () => {
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), '  test@example.com  ');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
    );
  });

  it('shows confirmation alert on successful signup', async () => {
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Check your email',
        'We sent you a confirmation link.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'OK' }),
        ])
      )
    );
  });

  it('navigates to login when OK is pressed on success alert', async () => {
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const okButton = alertCall[2].find((btn: any) => btn.text === 'OK');
    okButton.onPress();
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('shows error message when signUp fails', async () => {
    mockSignUp.mockResolvedValue({ error: new Error('Email already registered') });
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(screen.getByText('Email already registered')).toBeTruthy()
    );
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('accepts password exactly 6 characters long', async () => {
    render(<SignupScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), '123456');
    fireEvent.changeText(screen.getByPlaceholderText('Confirm Password'), '123456');
    fireEvent.press(screen.getByText('Create Account'));
    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', '123456')
    );
  });
});
