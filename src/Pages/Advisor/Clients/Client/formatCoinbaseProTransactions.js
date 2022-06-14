import coinbaseTokenNames from '../../coinbaseTokenNames.json'

export default async function formatCoinbaseProTransactions(newCoinbaseProTransactions, setTransactions) {
	console.log(newCoinbaseProTransactions)
	// [1.0] Format Buys and Sells
	const buysAndSells = formatBuysAndSells(newCoinbaseProTransactions)
	console.log(buysAndSells)

	// [2.0] Format Deposits and Withdrawals
	const depositsAndWithdrawals = formatDepositsAndWithdrawals(newCoinbaseProTransactions)
	console.log(depositsAndWithdrawals)

	// [3.0] Format Sends
	// const sends = await formatSends(newCoinbaseProTransactions)
	const sends = []
	console.log(sends)

	let newTransactions = [...buysAndSells, ...depositsAndWithdrawals, ...sends]
	newTransactions = newTransactions.sort((a, b) => a.updated_at.localeCompare(b.updated_at))
	setTransactions(newTransactions)
}

function formatBuysAndSells(newCoinbaseProTransactions) {
	// [1.1] Format Data by Trade Id
	let trades = {}
	newCoinbaseProTransactions.forEach(transaction => {
		if (transaction.type.S === 'match' || transaction.type.S === 'fee') {
			const tradeId = transaction.details.M.trade_id.S
			if (tradeId in trades) trades[tradeId].push(transaction)
			else trades[tradeId] = [transaction]
		}
	})
	console.log(trades)

	// [1.2] Format Trade Id's into the Transaction Data Structure
	let newTransactions = {}
	Object.entries(trades).forEach(([tradeId, tradeTransactions]) => {
		// [1.2.1] Format Id and Status
		let newTransaction = JSON.parse(JSON.stringify(transactionDataStructure))
		newTransaction.id = tradeId
		newTransaction.status = 'completed'

		// [1.2.2] Format Transaction Type (sell or buy)
		tradeTransactions.forEach(({ amount, holding, type }) => {
			if (holding.S === 'USD' && type.S === 'match') newTransaction.type = Number(amount.S) > 0 ? 'sell' : 'buy'
		})

		// [1.2.3] Format Transaction Details
		tradeTransactions.forEach(({ amount, created_at, holding, type }) => {
			if (holding.S === 'USD') {
				if (type.S === 'match') {
					newTransaction.native_amount.amount += Math.abs(Number(amount.S))
					newTransaction.updated_at = created_at.S
					newTransaction[newTransaction.type].subtotal.amount = Math.abs(Number(amount.S))
					newTransaction[newTransaction.type].total.amount += Math.abs(Number(amount.S))
				} else if (type.S === 'fee') {
					newTransaction.native_amount.amount += Math.abs(Number(amount.S))
					newTransaction[newTransaction.type].fee.amount = Math.abs(Number(amount.S))
					newTransaction[newTransaction.type].total.amount += Math.abs(Number(amount.S))
				}
			} else {
				newTransaction.amount.amount = Math.abs(Number(amount.S))
				newTransaction.amount.currency = holding.S
				newTransaction.details.payment_method_name = 'Cash (USD)'
				newTransaction.details.title = `${Number(amount.S) ? 'Bought' : 'Sold'} ${coinbaseTokenNames[holding.S]}`
				newTransaction[newTransaction.type].amount.currency = holding.S
			}
		})

		// [1.2.4] Calculate Unit Price
		const subtotal = newTransaction[newTransaction.type].subtotal.amount
		const tokenCount = newTransaction.amount.amount
		newTransaction[newTransaction.type].unit_price.amount = subtotal / tokenCount

		newTransactions[tradeId] = newTransaction
	})
	console.log(newTransactions)

	return Object.values(newTransactions)
}

function formatDepositsAndWithdrawals(newCoinbaseProTransactions) {
	let newDepositsAndWithdrawals = []

	newCoinbaseProTransactions.forEach(({ amount, created_at, holding, id, type }) => {
		if (type.S === 'transfer' && holding.S === 'USD') {
			let newTransaction = JSON.parse(JSON.stringify(transactionDataStructure))

			const event = Number(amount.S) > 0 ? 'fiat_deposit' : 'fiat_withdrawal'

			newTransaction.amount.amount = Number(amount.S)
			newTransaction.details.title = Number(amount.S) ? 'Deposited Funds' : 'Withdrew Funds'
			newTransaction.id = id.S
			newTransaction.native_amount.amount = Number(amount.S)
			newTransaction.status = 'completed'
			newTransaction.type = event
			newTransaction.updated_at = created_at.S

			newTransaction[event].amount.amount = Math.abs(Number(amount.S))
			newTransaction[event].amount.currency = 'USD'
			newTransaction[event].native_amount.amount = Math.abs(Number(amount.S))
			newTransaction[event].subtotal.amount = Math.abs(Number(amount.S))
			newTransaction[event].total.amount = Math.abs(Number(amount.S))

			newDepositsAndWithdrawals.push(newTransaction)
		}
	})

	return newDepositsAndWithdrawals
}

async function formatSends(newCoinbaseProTransactions) {
	let newSends = []

	for (let i = 0; i < newCoinbaseProTransactions.length; i++) {
		const { amount, created_at, holding, id, type } = newCoinbaseProTransactions[i]

		if (type.S === 'transfer' && holding.S !== 'USD') {
			let newTransaction = JSON.parse(JSON.stringify(transactionDataStructure))

			const coinbaseTokenName = coinbaseTokenNames[holding.S]
			const spotPrice = await GETSpotPrice(holding.S, created_at.S.slice(0, 10))

			newTransaction.amount.amount = -1 * Number(amount.S)
			newTransaction.amount.currency = holding.S
			newTransaction.details.title =
				Number(amount.S) > 0 ? `Sent ${coinbaseTokenName}` : `Received ${coinbaseTokenName}`
			newTransaction.id = id.S
			newTransaction.native_amount.amount = -1 * Number(amount.S) * spotPrice
			newTransaction.network.status = 'confirmed'
			newTransaction.type = 'send'
			newTransaction.updated_at = created_at.S

			newSends.push(newTransaction)
		}
	}

	// newCoinbaseProTransactions.forEach(({ amount, created_at, holding, id, type }) => {
	// 	if (type.S === 'transfer' && holding.S !== 'USD') {
	// 		let newTransaction = JSON.parse(JSON.stringify(transactionDataStructure))
	// 		const coinbaseTokenName = coinbaseTokenNames[holding.S]

	// 		newTransaction.amount.amount = Number(amount.S)
	// 		newTransaction.amount.currency = holding.S
	// 		newTransaction.details.title = Number(amount.S) ? `Sent ${coinbaseTokenName}` : `Received ${coinbaseTokenName}`
	// 		newTransaction.id = id.S
	// 		newTransaction.native_amount.amount = Number(amount.S)
	// 		newTransaction.network.status = 'confirmed'
	// 		newTransaction.type = 'send'
	// 		newTransaction.updated_at = created_at.S

	// 		newSends.push(newTransaction)
	// 	}
	// })

	return newSends
}

function GETSpotPrice(holding, date) {
	return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot?date=${date}`)
		.then(response => response.json())
		.then(response => response.data.amount)
}

const transactionDataStructure = {
	amount: {
		amount: 0,
		currency: ''
	},
	buy: {
		amount: {
			currency: ''
		},
		fee: {
			amount: 0
		},
		subtotal: {
			amount: 0
		},
		total: {
			amount: 0
		},
		unit_price: {
			amount: 0
		}
	},
	details: {
		payment_method_name: '',
		title: ''
	},
	fiat_deposit: {
		amount: {
			currency: ''
		},
		fee: {
			amount: 0
		},
		hold_until: '',
		native_amount: {
			amount: 0
		},
		subtotal: {
			amount: 0
		},
		total: {
			amount: 0
		},
		unit_price: {
			amount: 1
		}
	},
	fiat_withdrawal: {
		amount: {
			amount: 0,
			currency: ''
		},
		fee: {
			amount: 0
		},
		native_amount: {
			amount: 0
		},
		payout_at: '',
		subtotal: {
			amount: 0
		},
		total: {
			amount: 0
		},
		unit_price: {
			amount: 0
		}
	},
	id: '',
	native_amount: {
		amount: 0
	},
	network: {
		status: ''
	},
	sell: {
		amount: {
			currency: ''
		},
		fee: {
			amount: 0
		},
		subtotal: {
			amount: 0
		},
		total: {
			amount: 0
		},
		unit_price: {
			amount: 0
		}
	},
	status: '',
	type: '',
	updated_at: ''
}
