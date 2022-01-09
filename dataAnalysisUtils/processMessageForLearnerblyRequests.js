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
  const name = nameSection.slice(prefix.length).trim().replace(/\s\s+/g, " ");
  const title = titleSection
    .replace(/^\*/i, "")
    .replace(/\*\.$/i, "")
    .replace(/\.$/i, "")
    .replace("&amp;", "&")
    .trim()
    .replace(/\s\s+/g, " ");

  return { id, name, title, timestamp };
};

module.exports = processMessageForLearnerblyRequest;
