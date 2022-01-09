require("dotenv").config();

const axios = require("axios");
const {
  findChannelWithName,
  getAllMessagesInChannel,
} = require("./slackUtils");
const { processMessageForLearnerblyRequest } = require("./dataAnalysisUtils");

const authToken = process.env.SLACK_OAUTH_TOKEN;
if (!authToken) {
  throw new Error("OAuth Token not available");
}

axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

const slackConversationHistoryEndpoint =
  "https://slack.com/api/conversations.history";

(async () => {
  const learnerblyChannel = await findChannelWithName("learning-together");
  const learnerblyChannelMessages = await getAllMessagesInChannel(
    learnerblyChannel.id
  );

  const learnerblyRequests = learnerblyChannelMessages
    .map(processMessageForLearnerblyRequest)
    .filter(Boolean);

  console.log(learnerblyRequests);
  console.log(learnerblyRequests.length);
})();
