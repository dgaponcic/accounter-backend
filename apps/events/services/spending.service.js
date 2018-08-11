// const { Event } = require("../models/event.model");
// const { Spending } = require("../models/spending.model");

async function validateUser(event, user) {
  const participantsIDs = event.participants.map(x => String(x._id));
  const isParticipant = participantsIDs.includes(String(user._id));
  return isParticipant;
}
module.exports.validateUser = validateUser;
