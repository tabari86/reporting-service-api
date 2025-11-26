function format(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

module.exports = {
  info: (msg, ...args) => {
    console.log(format("INFO", msg), ...args);
  },
  error: (msg, ...args) => {
    console.error(format("ERROR", msg), ...args);
  },
};
