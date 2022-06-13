import React, { useEffect } from 'react'

const ClientTaxes = ({ transactions }) => {
	useEffect(() => {
		// [2.0] Calculate Realized Gains ($)
		// buys = { holding: [ { totalTokens, unitPrice }, ... ] }
		let holdings = {}
		let gains = 0
		let realizedBuys = 0
		let realizedSells = 0

		console.log(transactions)
		for (let i = 0; i < transactions.length; i++) {
			const holding = transactions[i].amount.currency
			const totalTokens = transactions[i].amount.amount
			const type = transactions[i].type
			const unitPrice = transactions[i].native_amount.amount / totalTokens

			if (type === 'send') console.log(transactions[i])
			if (holding === 'USD') continue

			switch (type) {
				case 'buy':
					handleBuy(holdings, holding, totalTokens, unitPrice)
					break
				case 'sell':
					handleSell(gains, holdings, holding, realizedBuys, realizedSells, totalTokens, unitPrice)
					break
				case 'send':
					if (transactions[i].details.subtitle === 'From Coinbase') {
						handleBuy(holdings, holding, totalTokens, unitPrice)
					}
					break
				default:
					break
			}
		}
		console.log(holdings)

		// [2.0] Calculate Realized Gains ($)

		// [3.0] Calculate Unrealized Gains ($)
	}, [transactions])

	function handleBuy(holdings, holding, totalTokens, unitPrice) {
		if (holding in holdings) holdings[holding].push({ unitPrice, totalTokens })
		else holdings[holding] = [{ unitPrice, totalTokens }]
		holdings[holding] = holdings[holding].sort((a, b) => b.unitPrice - a.unitPrice)
	}

	function handleSell(gains, holdings, holding, realizedBuys, realizedSells, totalTokens, unitPrice) {
		let totalSellAmount = -1 * totalTokens

		for (let j = 0; j < holdings[holding].length; j++) {
			if (totalSellAmount <= 0) break
			if (holdings[holding][j].totalTokens <= 0) continue

			const sellAmount = Math.min(totalSellAmount, holdings[holding][j].totalTokens)
			const buy = sellAmount * holdings[holding][j].unitPrice
			const sell = sellAmount * unitPrice

			gains += sell - buy
			realizedBuys += buy
			realizedSells += sell

			holdings[holding][j].totalTokens -= sellAmount
			totalSellAmount -= sellAmount
		}
	}

	return (
		<div className='ResponsiveTable'>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Taxes</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>ACCOUNTING METHOD</th>
						<th>HOLDING</th>
						<th>REALIZED GAINS ($)</th>
						<th>UNREALIZED GAINS ($)</th>
						<th>REALIZED GAINS (%)</th>
						<th className='Break'>UNREALIZED GAINS (%)</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	)
}

export default ClientTaxes
