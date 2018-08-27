import Spending from '../models/spending.model';
import * as eventService from './event.service';

export async function findSpendingById(id) {
  const spending = await Spending.findById(id);
  return spending;
}

export async function findSpendingByIdAndPopulate(id) {
  const spending = await Spending.findById(id)
  .populate({
    path: 'participants.participant',
    select: 'username',
    model: 'User',
  });
  return spending;
}

// Check if the spending belongs to event
export function checkSpending(event, spending) {
  let check = false;
  event.spendings.forEach((item) => {
    if (String(item._id) === String(spending._id)) check = true;
  });
  return check;
}

async function getSpending(spendingsId, page) {
  const limit = 2;
  const pages = Math.ceil(spendingsId.length / limit);
  let skip = 0;
  if (pages > 0) skip = (page - 1) * limit;
  if (page > pages) page = pages;
// Find spendings by id and return their name
  const spendings = await Spending.find(
    { _id: { $in: spendingsId }, type: 'spending' },
    { name: 1, _id: 1, type: 1 },
  )
  .sort()
  .skip(skip)
  .limit(limit);
  return {
    spendings,
    pages,
  };
}

// Find all spendings of an event
export async function getSpendings(event, page) {
  const spendingsId = event.spendings;
  const spendings = await getSpending(spendingsId, page);
  return spendings;
}

function filterParticipants(participants) {
  const filteredParticipants = [...new Set(participants)];
  return filteredParticipants;
}

export async function updateSpending(newSpending, oldSpending, user, event) {
  newSpending.participants = [];
  const spending = await Spending.findByIdAndUpdate({ _id: oldSpending._id }, newSpending);
  const filteredPayers = filterParticipants(newSpending.payers);
  const filteredConsumers = filterParticipants(newSpending.consumers);
  // Add participants to spending
  if (filteredPayers) await eventService.addParticipants(filteredPayers, 'payer', spending);
  if (filteredConsumers) await eventService.addParticipants(filteredConsumers, 'consumer', spending);
  // Add activity to history
  const object = { type: 'Spending', object: spending, name: spending.name };
  eventService.addActivity(user, 'updated', object, event);
  await spending.save();
}

export async function deleteSpending(user, spending, event) {
  await event.deleteSpending(spending);
  const object = { type: 'Spending', object: spending, name: spending.name };
  await eventService.addActivity(user, 'deleted', object, event);
  await Spending.findByIdAndRemove(spending._id);
}

// Search a spending by name by query
export async function searchSpendings(event, query) {
  const spendingsIds = event.spendings;
  const limit = 10;
  const spendings = await Spending.find(
    { _id: { $in: spendingsIds },
      name: {
      $regex: new RegExp(query, 'i'),
      },
    }, { name: 1, createdAt: 1 },
  )
  .sort({ createdAt: -1 })
  .limit(limit);
  return spendings;
}
