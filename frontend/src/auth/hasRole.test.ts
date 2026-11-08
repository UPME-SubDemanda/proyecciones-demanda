import { describe, expect, it } from 'vitest';
import { hasRole } from './AuthContext';

describe('hasRole', () => {
  const u = (roles: string[]) => ({ id: 1, email: 'a@b', name: '', roles });
  it('admin puede todo', () => expect(hasRole(u(['admin']), 'approver')).toBe(true));
  it('sin el rol no pasa', () => expect(hasRole(u(['viewer']), 'approver')).toBe(false));
  it('sin usuario no pasa', () => expect(hasRole(null, 'viewer')).toBe(false));
});
