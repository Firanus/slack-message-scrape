require("dotenv").config();

const axios = require("axios");

const authToken = process.env.SLACK_OAUTH_TOKEN;
if (!authToken) {
  throw new Error("OAuth Token not available");
}

axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

const slackListConversationsEndpoint =
  "https://slack.com/api/conversations.list";

const slackConversationHistoryEndpoint =
  "https://slack.com/api/conversations.history";

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

(async () => {
  const learnerblyChannel = await findChannelWithName("learning-together");

  const result = await axios.get(
    `${slackConversationHistoryEndpoint}?channel=${learnerblyChannel.id}`
  );
  console.log(JSON.stringify(result.data, null, 2));
})();
