const axios = require("axios");

const slackConversationHistoryEndpoint =
  "https://slack.com/api/conversations.history";

const getAllMessagesInChannel = async (channelId) => {
  let { data } = await axios.get(
    `${slackConversationHistoryEndpoint}?channel=${channelId}`
  );

  const { messages, response_metadata } = data;

  let messagesToReturn = messages;
  let nextCursor = response_metadata?.next_cursor;

  while (nextCursor) {
    const { data: newData } = await axios.get(
      `${slackConversationHistoryEndpoint}?channel=${channelId}&cursor=${nextCursor}`
    );

    messagesToReturn = messagesToReturn.concat(newData.messages);
    nextCursor = newData.response_metadata?.next_cursor;
  }

  return messagesToReturn;
};

module.exports = getAllMessagesInChannel;
