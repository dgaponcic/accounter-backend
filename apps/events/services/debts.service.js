import { findSpendingByIdAndPopulate } from './spending.service';

function count(spending, type) {
  const participants = spending.participants.reduce((total, participant) => {
    return participant.type === type ? total + 1 : total;
  }, 0);
  return participants;
}

function countDebts(spending, debts) {
  const payers = count(spending, 'payer');
  const consumers = count(spending, 'consumer');
  const { price } = spending;
  const payerAmount = Math.round(price / payers);
	const consumerAmount = Math.round(price / consumers);
	let lastKey;
  spending.participants.forEach((participant) => {
    const { username } = participant.participant;
    if (participant.type === 'payer') {
      debts[username] += payerAmount;
    }
    if (participant.type === 'consumer') {
      debts[username] -= consumerAmount;
		}
		lastKey = username;
	});
	var sum = Object.values(debts).reduce((total, value) => {
		return total + value;
	});
	debts[lastKey] -= sum;
  return debts;
}

function initializeDebts(event) {
  const { participants } = event;
  const debts = {};
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
			if (debts[key1] + debts[key2] === 0 && debts[key1] !== 0) {
				results.push({ from: key1, to: key2, amount: Math.abs(debts[key1]) });
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

function checkDebts(debts) {
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
	if (isOver) {
		return {
		debts,
		results,
		};
	}
	debts = findComplementaryValues(debts, results);
	results = debts.results;
	while (debts.isComplemetary) {
		debts = findComplementaryValues(debts.debts, results);
		results = debts.results;
	}
	return combineMaxAndMinValues(debts.debts, results);
}

export async function calculateDebts(event) {
	const { spendings } = event;
  if (!spendings) return null;
	let debts = initializeDebts(event);
	let totalDebts = await spendings.map(async (spending) => {
    const populatedSpending = await findSpendingByIdAndPopulate(spending);
		debts = await countDebts(populatedSpending, debts);
		return debts;
	});
	totalDebts = await Promise.all(totalDebts);
	totalDebts = totalDebts[totalDebts.length - 1];
	let results = [];
	const result = algorithm(totalDebts, results, 0);
	results = result.results;
	return results;
}
