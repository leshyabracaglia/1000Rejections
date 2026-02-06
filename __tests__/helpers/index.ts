import { Rejection } from '../types';

export function mockRejection(overrides: Partial<Rejection> = {}): Rejection {
  return {
    id: 'test-id-1',
    user_id: 'user-123',
    title: 'Test Rejection',
    description: 'A test description',
    image_url: null,
    date: '2025-01-15',
    created_at: '2025-01-15T00:00:00Z',
    ...overrides,
  };
}
