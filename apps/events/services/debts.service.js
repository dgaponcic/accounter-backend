import { findSpendingByIdAndPopulate } from './spending.service';
import Spending from '../models/spending.model';

// Count the number of payers and consumers
function count(spending, type) {
  const participants = spending.participants.reduce((total, participant) => {
    return participant.type === type ? total + 1 : total;
  }, 0);
  return participants;
}

function findMaxKey(object) {
	const maxKey = Object.keys(object).reduce((prev, current) => {
		return (object[prev] < object[current]) ? prev : current;
	});
	return maxKey;
}

function findMinKey(object) {
	const minKey = Object.keys(object).reduce((prev, current) => {
		return (object[prev] > object[current]) ? prev : current;
	});
	return minKey;
}

function roundDebts(debts) {
	const normalizeSum = {};
	Object.keys(debts).forEach((key) => {
		normalizeSum[key] = debts[key] - Math.round(debts[key]);
		debts[key] = Math.round(debts[key]);
	});
	const sum = Object.values(debts).reduce((total, value) => {
		return total + value;
	});
	if (sum < 0) {
		const key = findMinKey(normalizeSum);
		debts[key] -= sum;
	}
	if (sum > 0) {
		const key = findMaxKey(normalizeSum);
		debts[key] -= sum;
	}
	return debts;
}

export function countDebts(spending, debts) {
  const payers = count(spending, 'payer');
  const consumers = count(spending, 'consumer');
  const { price } = spending;
  const payerAmount = price / payers;
	const consumerAmount = price / consumers;
	if (!spending.participants) return debts;
  spending.participants.forEach((participant) => {
		const { username } = participant.participant;
    if (participant.type === 'payer') {
      debts[username] += payerAmount;
    }
    if (participant.type === 'consumer') {
      debts[username] -= consumerAmount;
		}
	});
  return debts;
}

// Initialize the debts object
export function initializeDebts(event) {
	const { participants } = event;
	const debts = {};
	if (!participants) return {};
  participants.forEach((participant) => {
		const { username } = participant.participant;
    debts[username] = 0;
	});
  return debts;
}

function combineMaxAndMinValues(debts, results) {
	const sortedDebts = Object.entries(debts).sort((a, b) => a[1] - b[1]);
	const { length } = sortedDebts;
	const value = sortedDebts[0][1] + sortedDebts[length - 1][1];
	if (value > 0) {
		results.push({
			from: sortedDebts[0][0],
			to: sortedDebts[length - 1][0],
			amount: Math.abs(sortedDebts[0][1]),
			});
			sortedDebts[length - 1][1] += sortedDebts[0][1];
			sortedDebts[0][1] = 0;
	}
	if (value < 0) {
		results.push({
			from: sortedDebts[0][0],
			to: sortedDebts[length - 1][0],
			amount: Math.abs(sortedDebts[length - 1][1]),
			});
			sortedDebts[0][1] += sortedDebts[length - 1][1];
			sortedDebts[length - 1][1] = 0;
	}
	const sortedDebtsObject = {};
  for (let i = 0; i < sortedDebts.length; i += 1) {
    sortedDebtsObject[sortedDebts[i][0]] = sortedDebts[i][1];
	}
	return algorithm(sortedDebtsObject, results);
}

function findComplementaryValues(debts, results) {
	let isComplemetary = false;
	Object.keys(debts).forEach((key1) => {
		Object.keys(debts).forEach((key2) => {
			let [from, to] = [key1, key2];
			if (debts[key1] + debts[key2] === 0 && debts[key1] !== 0) {
				if (debts[key1] > debts[key2]) [from, to] = [to, from];
					results.push({ from, to, amount: Math.abs(debts[key1]) });
				debts[key1] = 0;
				debts[key2] = 0;
				isComplemetary = true;
			}
		});
	});
	return {
		debts,
		isComplemetary,
		results,
	};
}

// Check if all the fields in debts object are 0
// Stop the algorithm if they are
export function checkDebts(debts) {
	let isOver = true;
	Object.keys(debts).forEach((key) => {
		if (debts[key] !== 0) {
			isOver = false;
		}
	});
	return isOver;
}

function algorithm(debts, results) {
	const isOver = checkDebts(debts);
	if (isOver) return { debts, results };
	debts = findComplementaryValues(debts, results);
	({ results } = debts);
	while (debts.isComplemetary) {
		debts = findComplementaryValues(debts.debts, results);
		({ results } = debts);
	}
	return combineMaxAndMinValues(debts.debts, results);
}

export async function initializeDebtsCalculation(event) {
	const { spendings } = event;
  if (!spendings.length) return null;
	let debts = initializeDebts(event);
	let totalDebts = await spendings.map(async (spending) => {
		const populatedSpending = await findSpendingByIdAndPopulate(spending);
		debts = await countDebts(populatedSpending, debts);
		return debts;
	});
	totalDebts = await Promise.all(totalDebts);
	totalDebts = roundDebts(totalDebts[totalDebts.length - 1]);
	return totalDebts;
}

export async function calculateDebts(event) {
	const totalDebts = await initializeDebtsCalculation(event);
	let results = [];
	if (!totalDebts) return null;
	const result = algorithm(totalDebts, results);
	({ results } = result);
	return results;
}

function amountPerSpending(spending, percentages) {
	const payerAmount = spending.price / count(spending, 'payer');
	const { participants } = spending;
	participants.forEach((participant) => {
		if (participant.type === 'payer') {
			percentages[participant.participant.username] += payerAmount;
		}
	});
	return percentages;
}

function calculatePercentage(percentages, sum) {
	const findExtreme = {};
	let percentagesSum = 0;
	Object.keys(percentages).forEach((key) => {
		const percentage = percentages[key] / sum * 100;
		findExtreme[key] = percentage - Math.round(percentage);
		percentages[key] = Math.round(percentage);
		percentagesSum += Math.round(percentage);
	});
	if (percentagesSum > 100) {
		const maxKey = findMaxKey(findExtreme);
		percentages[maxKey] -= (percentagesSum - 100);
	}
	if (percentagesSum < 100) {
		const minKey = findMinKey(findExtreme);
		percentages[minKey] += (percentagesSum - 100);
	}
	return percentages;
}

function calculateAmount(percentages, spendings) {
	let sum = 0;
	spendings.forEach((spending) => {
		sum += spending.price;
		percentages = amountPerSpending(spending, percentages);
	});
	return calculatePercentage(percentages, sum);
}

export async function getPercentages(spendingsId, event) {
	let spendings = await Spending.find(
    { _id: { $in: spendingsId }, type: 'spending' },
	);
	if (!spendings.length) return null;
	const percentages = initializeDebts(event);
	spendings = await spendings.map(async (spending) => {
		return findSpendingByIdAndPopulate(spending._id);
	});
	spendings = await Promise.all(spendings);
	return calculateAmount(percentages, spendings);
}
