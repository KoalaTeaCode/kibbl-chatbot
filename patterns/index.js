const patternDict = [
  {
    pattern: '\\b(?<greeting>Hi|Hello|Hey)\\b',
    intent: 'Hello',
  },
  {
    pattern: '\\b(bye|exit)\\b',
    intent: 'Exit',
  },
  {
    pattern: 'like\\sin\\s\\b(?<city>.+)',
    intent: 'CurrentWeather',
  },
  {
    pattern: '\\b(?<weather>hot|cold|rain|rainy|sunny|snow|thunderstorms|windy|drizzle)\\b\\s\
      in\\s\
      \\b(?<city>[a-z]+[a-z]+?)\\b(?<time>day\\safter\\stomorrow|tomorrow|today)$',
    intent: 'WeatherForecast',
  },
  {
    pattern: '\\b(?<weather>hot|cold|rain|rainy|sunny|snow|thunderstorms|windy|drizzle)\\b\\s\
      \\b(?<time>day\\safter\\stomorrow|tomorrow|today)\\sin\\s\\b(?<city>[a-z]+[a-z]+?)$',
    intent: 'WeatherForecast',
  },
  {
    pattern: '\\bshow\\stasks\\b',
    intent: 'ShowTasks',
  },
  {
    pattern: '\\bwho\\sare\\syou\\b[?.]?\\b',
    intent: 'WhoAreYou',
  },
  {
    pattern: '\\b(find|show|list)\\s(?<age>baby|young|adult|senior|old|older)?\\s?(?<gender>male|boy|female|girl)?\\s?(?<item>dog|dogs|cat|cats|event|events|pet|pets|shelter|shelters)\\s?(?<near>near|by|close to|in)?\\s?(?<location>[a-z]+[a-z]+?)?\\b[?.]?$',
    intent: 'GenericKibblSearch',
  },
  // {
  //   pattern: '\\b(find|show|list)\\s(<item>event|events)\\s(?<after>after)?\\s?([a-z]+[a-z]+?)?\\s?(?<before>before)?\\s?([a-z]+[a-z]+?)?\\b[?.]?\\b',
  //   intent: 'FindEventRange',
  // },
];

module.exports = patternDict;
