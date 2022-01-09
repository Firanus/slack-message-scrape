const axios = require("axios");

const slackListConversationsEndpoint =
  "https://slack.com/api/conversations.list";

const findChannelWithName = async (name) => {
  const result = await axios.get(slackListConversationsEndpoint);
  let { channels, response_metadata } = result.data;

  let desiredChannel = channels.find((channel) => channel.name.includes(name));

  while (!desiredChannel && response_metadata.next_cursor) {
    let nextResult = await axios.get(
      `${slackListConversationsEndpoint}?cursor=${response_metadata.next_cursor}`
    );

    channels = nextResult.data.channels;
    response_metadata = nextResult.data.response_metadata;

    desiredChannel = channels.find((channel) => channel.name.includes(name));
  }

  return desiredChannel;
};

module.exports = findChannelWithName;
