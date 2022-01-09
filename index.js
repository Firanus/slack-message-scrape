require("dotenv").config();

const axios = require("axios");
const { findChannelWithName, getAllMessagesInChannel } = require("./utils");

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

const learnerblyBotId = "B022NBT3LR0";
const generateMessageId = (user, ts) => `${user}:${ts}`;

const processMessageForLearnerblyRequest = (message) => {
  const { blocks, bot_id, ts, user } = message;

  if (!blocks || bot_id !== learnerblyBotId) {
    return undefined;
  }

  const timestamp = new Date(parseFloat(ts) * 1000);
  const id = generateMessageId(user, ts);
  const text = blocks[0].text.text;

  const prefix = "New learning request! ";
  const seperator = " has just requested ";

  if (!text.includes(prefix) || !text.includes(seperator)) {
    return undefined;
  }

  const firstLine = text.split("\n")[0];
  const [nameSection, titleSection] = firstLine.split(seperator);
  const name = nameSection.slice(prefix.length);
  const title = titleSection.slice(1, titleSection.length - 2);

  return { id, name, title, timestamp };
};
