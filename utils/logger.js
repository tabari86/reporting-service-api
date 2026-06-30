function format(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

function shouldLogInfo() {
  return process.env.NODE_ENV !== "test";
}

module.exports = {
  info: (msg, ...args) => {
    if (!shouldLogInfo()) {
      return;
    }

    console.log(format("INFO", msg), ...args);
  },
  error: (msg, ...args) => {
    console.error(format("ERROR", msg), ...args);
  },
};
