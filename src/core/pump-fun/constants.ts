import {
  BOT_SERVICE_FEE_IN_SOL,
  BOT_TOKEN_PASS_PRICE_IN_SOL,
} from "../../shared/constants";

// Bot description must be maximum 250 characters
export const BOT_DESCRIPTION = `zpump.fun | ${generateRandomSentence()}`;
// export const BOT_DESCRIPTION = `🌐 ezpump.fun - Easy to use. Only for ${BOT_SERVICE_FEE_IN_SOL} per bump, or ${BOT_TOKEN_PASS_PRICE_IN_SOL} per token! Type shit, fr. 🚀`;

function generateRandomSentence(): string {
  const subjects = [
    "The cat",
    "A robot",
    "My neighbor",
    "An old man",
    "The programmer",
    "A ghost",
    "Someone",
    "Nobody",
    "This thing",
    "A frog",
  ];
  const verbs = [
    "eats",
    "writes",
    "throws",
    "builds",
    "destroys",
    "debugs",
    "sings",
  ];
  const objects = [
    "a sandwich",
    "code",
    "a brick",
    "the internet",
    "a spaceship",
    "JavaScript",
    "a meme",
    "a keyboard",
  ];
  const adverbs = [
    "quickly",
    "loudly",
    "silently",
    "accidentally",
    "angrily",
    "without warning",
    "with joy",
  ];
  const emojis = ["😹", "🤖", "🧱", "🚀", "🕸️", "🧠", "💥", "👀"];

  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  const object = objects[Math.floor(Math.random() * objects.length)];
  const adverb = adverbs[Math.floor(Math.random() * adverbs.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return `${subject} ${verb} ${object} ${adverb}. ${emoji}`;
}
