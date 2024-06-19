import {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  users,
} from "../src/utils/users";

describe("Chat Users Utility Functions", () => {
  beforeEach(() => {
    // Clear users array before each test
    users.length = 0;
  });

  it("should add a new user to the chat", () => {
    const user = userJoin("1", "User1", "Room1");

    expect(user).toEqual({ id: "1", username: "User1", room: "Room1" });
    expect(getRoomUsers("Room1")).toContainEqual(user);
  });

  it("should get current user", () => {
    const user = userJoin("1", "User1", "Room1");

    expect(getCurrentUser("1")).toEqual(user);
  });

  it("should remove a user from the chat", () => {
    const user = userJoin("1", "User1", "Room1");

    const result = userLeave("1");

    expect(result).toEqual(user);
    expect(getRoomUsers("Room1")).not.toContainEqual(user);
  });

  it("should return users in a specific room", () => {
    userJoin("1", "User1", "Room1");
    userJoin("2", "User2", "Room1");
    userJoin("3", "User3", "Room2");

    expect(getRoomUsers("Room1").length).toBe(2);
    expect(getRoomUsers("Room1")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "User1" }),
        expect.objectContaining({ username: "User2" }),
      ])
    );
  });
});
