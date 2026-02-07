import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

const mockSignIn = jest.fn();
const mockReplace = jest.fn();

jest.mock('../../lib/auth', () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

jest.mock('expo-router', () => ({
  router: { replace: (...args: any[]) => mockReplace(...args) },
  Link: ({ children }: any) => children,
}));

import LoginScreen from '../../app/(auth)/login';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
  });

  it('renders form with email, password, and sign in button', () => {
    render(<LoginScreen />);
    expect(screen.getByText('1000 Rejections')).toBeTruthy();
    expect(screen.getByText('Embrace rejection, build resilience')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('shows forgot password and sign up links', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Forgot password?')).toBeTruthy();
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('shows error when submitting with empty fields', async () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() =>
      expect(screen.getByText('Please enter email and password')).toBeTruthy()
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows error when email is empty but password is filled', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() =>
      expect(screen.getByText('Please enter email and password')).toBeTruthy()
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows error when password is empty but email is filled', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() =>
      expect(screen.getByText('Please enter email and password')).toBeTruthy()
    );
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn with trimmed email and password', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), '  test@example.com  ');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    );
  });

  it('navigates to main on successful sign in', async () => {
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/(main)')
    );
  });

  it('shows error message when signIn fails', async () => {
    mockSignIn.mockResolvedValue({ error: new Error('Invalid credentials') });
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() =>
      expect(screen.getByText('Invalid credentials')).toBeTruthy()
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('clears previous error on new submission', async () => {
    mockSignIn.mockResolvedValueOnce({ error: new Error('Bad request') });
    render(<LoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByText('Bad request')).toBeTruthy());

    mockSignIn.mockResolvedValueOnce({ error: null });
    fireEvent.press(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.queryByText('Bad request')).toBeNull());
  });
});
