require("dotenv").config();

const axios = require("axios");
const { findChannelWithName } = require("./utils");

const authToken = process.env.SLACK_OAUTH_TOKEN;
if (!authToken) {
  throw new Error("OAuth Token not available");
}

axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

const slackConversationHistoryEndpoint =
  "https://slack.com/api/conversations.history";

(async () => {
  const learnerblyChannel = await findChannelWithName("learning-together");

  const result = await axios.get(
    `${slackConversationHistoryEndpoint}?channel=${learnerblyChannel.id}`
  );
  const processedResult = processLearnerblyResult(result);
  // console.log(processedResult);
})();

const learnerblyBotId = "B022NBT3LR0";

const processLearnerblyResult = (result) => {
  const { data } = result;
  console.log(data);
  const { messages } = data;

  const learnerblyInformation = messages
    .filter((message) => message.bot_id === learnerblyBotId)
    .map((message) => {
      const firstBlock = message.blocks[0];
      const text = firstBlock.text.text;

      const prefix = "New learning request! ";
      const seperator = " has just requested ";

      const firstLine = text.split("\n")[0];
      const [nameSection, titleSection] = firstLine.split(seperator);
      const name = nameSection.slice(prefix.length);
      const title = titleSection.slice(1, titleSection.length - 2);

      return { name, title };
    });

  return learnerblyInformation;
};
