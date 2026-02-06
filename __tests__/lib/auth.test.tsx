import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signUp: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

import { AuthProvider, useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

function TestConsumer() {
  const { user, loading } = useAuth();
  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="user">{user ? user.email : 'null'}</Text>
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockAuth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });
  });

  it('resolves to no user after loading', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading').props.children).toBe('false'));
    expect(screen.getByTestId('user').props.children).toBe('null');
  });

  it('restores session from Supabase on mount', async () => {
    const session = { user: { id: '123', email: 'test@example.com' }, access_token: 'tok' };
    (mockAuth.getSession as jest.Mock).mockResolvedValue({ data: { session } });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('user').props.children).toBe('test@example.com'));
  });

  it('cleans up auth subscription on unmount', () => {
    const unsubscribe = jest.fn();
    (mockAuth.onAuthStateChange as jest.Mock).mockReturnValue({ data: { subscription: { unsubscribe } } });
    const { unmount } = render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(mockAuth.onAuthStateChange).toHaveBeenCalled();
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
    (console.error as jest.Mock).mockRestore();
  });
});
