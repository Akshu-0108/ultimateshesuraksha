const asyncHandler = require("../middleware/asyncHandler");
const { getChatbotReply } = require("../utils/chatbotEngine");

// @route   POST /api/chatbot/message
// @access  Public
const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error("'message' is required and cannot be empty");
  }

  const { reply, intent } = getChatbotReply(message.trim());
  res.status(200).json({ reply, intent });
});

module.exports = { sendMessage };
