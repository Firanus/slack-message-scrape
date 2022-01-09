require("dotenv").config();

const axios = require("axios");
const {
  findChannelWithName,
  getAllMessagesInChannel,
} = require("./slackUtils");
const {
  processMessageForLearnerblyRequest,
  writeRequestsToFile,
  writeRequestsPerItemToFile,
  writeRequestsPerPersonToFile,
} = require("./dataAnalysisUtils");
const { developers } = require("./hiddenConstants");

const authToken = process.env.SLACK_OAUTH_TOKEN;
if (!authToken) {
  throw new Error("OAuth Token not available");
}

axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

(async () => {
  const learnerblyChannel = await findChannelWithName("learning-together");
  const learnerblyChannelMessages = await getAllMessagesInChannel(
    learnerblyChannel.id
  );

  const learnerblyRequests = learnerblyChannelMessages
    .map(processMessageForLearnerblyRequest)
    .filter(Boolean);

  writeRequestsToFile(learnerblyRequests, "requests.txt");
  writeRequestsPerItemToFile(learnerblyRequests, "requestsByTitle.txt");
  writeRequestsPerPersonToFile(learnerblyRequests, "requestsByName.txt");

  const devLearnerblyRequests = learnerblyRequests.filter((x) =>
    developers.includes(x.name)
  );

  writeRequestsToFile(devLearnerblyRequests, "requests - devs.txt");
  writeRequestsPerItemToFile(
    devLearnerblyRequests,
    "requestsByTitle - devs.txt"
  );
  writeRequestsPerPersonToFile(
    devLearnerblyRequests,
    "requestsByName - devs.txt"
  );
})();
