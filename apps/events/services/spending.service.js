import Spending from '../models/spending.model';

export async function findSpendingById(id) {
	const spending = await Spending.findById(id)
  return spending;
}

export async function checkSpending(event, spending) {
	if (spending in event.spendings) return true;
	return false;
}
