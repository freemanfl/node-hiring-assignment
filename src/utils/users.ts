interface User {
  id: string;
  username: string;
  room: string;
}

const users: User[] = [];

export { users }; // Export the users array

// Join user to chat
export function userJoin(id: string, username: string, room: string): User {
  const user: User = { id, username, room };
  users.push(user);
  return user;
}

// Get current user
export function getCurrentUser(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

// User leaves chat
export function userLeave(id: string): User | undefined {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
export function getRoomUsers(room: string): User[] {
  return users.filter((user) => user.room === room);
}
