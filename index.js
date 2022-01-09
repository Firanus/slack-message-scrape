require("dotenv").config();

var fs = require("fs");
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

(async () => {
  const learnerblyChannel = await findChannelWithName("learning-together");
  const learnerblyChannelMessages = await getAllMessagesInChannel(
    learnerblyChannel.id
  );

  const learnerblyRequests = learnerblyChannelMessages
    .map(processMessageForLearnerblyRequest)
    .filter(Boolean);

  writeRequestsToFile(learnerblyRequests, "requests.txt");
  writeRequestsPerItemToFile(learnerblyRequests, "requestsByName.txt");
  writeRequestsPerPersonToFile(learnerblyRequests, "requestsByTitle.txt");
})();

const writeRequestsToFile = (requests, filename) => {
  const stream = fs.createWriteStream(filename);
  stream.once("open", function (fd) {
    stream.write("id;name;title;timestamp\n");
    requests.forEach((x) =>
      stream.write(
        `${x.id};${x.name};${x.title};${x.timestamp.toISOString()}\n`
      )
    );
    stream.end();
  });
};

const writeRequestsPerItemToFile = (requests, filename) => {
  let requestsByItem = {};
  requests.forEach((req) => {
    const existingRequests = requestsByItem[req.title];
    if (!existingRequests) {
      requestsByItem[req.title] = {
        count: 1,
        requesters: [req.name],
      };
    } else {
      requestsByItem[req.title] = {
        count: existingRequests.count + 1,
        requesters: [...existingRequests.requesters, req.name],
      };
    }
  });

  const stream = fs.createWriteStream(filename);
  stream.once("open", function (fd) {
    stream.write("Title;Times Requested;Requesters\n");
    Object.keys(requestsByItem).forEach((title) => {
      const requests = requestsByItem[title];
      stream.write(
        `${title};${requests.count};${requests.requesters.join(",")}\n`
      );
    });
    stream.end();
  });
};

const writeRequestsPerPersonToFile = (requests, filename) => {
  let requestsByPerson = {};
  requests.forEach((req) => {
    const existingRequests = requestsByPerson[req.name];
    if (!existingRequests) {
      requestsByPerson[req.name] = {
        count: 1,
        titles: [req.title],
      };
    } else {
      requestsByPerson[req.name] = {
        count: existingRequests.count + 1,
        titles: [...existingRequests.titles, req.title],
      };
    }
  });

  const stream = fs.createWriteStream(filename);
  stream.once("open", function (fd) {
    stream.write("Name;Titles Requested;Titles\n");
    Object.keys(requestsByPerson).forEach((name) => {
      const requests = requestsByPerson[name];
      stream.write(`${name};${requests.count};${requests.titles.join(",")}\n`);
    });
    stream.end();
  });
};
