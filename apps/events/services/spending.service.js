import Spending from '../models/spending.model';

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
export async function checkSpending(event, spending) {
  if (spending in event.spendings) return true;
  return false;
}

async function getSpending(spendingsId) {
// Find spendings by id and return their name
  const spendings = await Spending.find(
    { _id: { $in: spendingsId } },
    { name: 1, _id: 1, type: 1},
  );
  return spendings;
}

// Find all spendings of an event
export async function getSpendings(event) {
  const spendingsId = event.spendings;
  const spendings = await getSpending(spendingsId);
  return spendings;
}

export async function updateSpending(newSpending, oldSpending) {
  const spending = await Spending.findByIdAndUpdate({ _id: oldSpending._id }, newSpending);
  await spending.save();
}
