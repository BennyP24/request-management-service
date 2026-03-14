import { User } from '../models/user';

const store = new Map<string, User>();

const seededUsers: User[] = [
  { id: '1', username: 'requester1', password: 'pass123', role: 'requester' },
  { id: '2', username: 'requester2', password: 'pass123', role: 'requester' },
  { id: '3', username: 'approver1', password: 'pass123', role: 'approver' },
];

for (const user of seededUsers) {
  store.set(user.id, user);
}

export function findByUsername(username: string): User | undefined {
  return Array.from(store.values()).find((u) => u.username === username);
}

export function findById(id: string): User | undefined {
  return store.get(id);
}
