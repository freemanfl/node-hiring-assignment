import { formatMessage } from "../src/utils/messages";

describe("formatMessage", () => {
  it("should format the message with username, text, and time", () => {
    const username = "User1";
    const text = "Hello, world!";
    const result = formatMessage(username, text);

    expect(result).toHaveProperty("username", username);
    expect(result).toHaveProperty("text", text);
    expect(result).toHaveProperty("time");
  });

  it("should include the current time", () => {
    const username = "User1";
    const text = "Hello, world!";
    const result = formatMessage(username, text);

    // Assuming the format is "h:mm a"
    const timePattern = /\d{1,2}:\d{2} [ap]m/;
    expect(result.time).toMatch(timePattern);
  });
});
