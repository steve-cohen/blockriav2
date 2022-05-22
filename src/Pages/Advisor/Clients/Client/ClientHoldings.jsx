import React, { useEffect, useState } from 'react'
import coinbaseTokenNames from '../../coinbaseTokenNames.json'

function formatPercent(number) {
	return number.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'percent'
	})
}

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

function getSpotPrice(holding, timePeriod = '') {
	let url = `https://blockria.com/v2/prices/${holding}-USD/spot`

	if (timePeriod) {
		let date = new Date()
		switch (timePeriod) {
			case '1D':
				date.setDate(date.getDate() - 1)
				break
			case '1W':
				date.setDate(date.getDate() - 7)
				break
			case '1M':
				date.setMonth(date.getMonth() - 1)
				break
			case '3M':
				date.setMonth(date.getMonth() - 3)
				break
			case 'YTD':
				date.setDate(1)
				date.setMonth(0)
				break
			case '1Y':
				date.setFullYear(date.getFullYear() - 1)
				break
			default:
				break
		}
		url += `?date=${date.toISOString().slice(0, 10)}`
	}

	return fetch(url)
		.then(response => response.json())
		.then(response => {
			const key = timePeriod ? `${response.data.base}-${timePeriod}` : response.data.base
			const value = Number(response.data.amount)
			return { [key]: value }
		})
		.catch(error => alert(error))
}

const ClientHoldings = ({
	client,
	totalBalance,
	totalBalanceNonTradeable,
	setTotalBalance,
	setTotalBalanceNonTradeable
}) => {
	const [holdings, setHoldings] = useState([])
	const [holdingsNonTradeable, setHoldingsNonTradeable] = useState([])
	const [spotPrices, setSpotPrices] = useState({})
	const [totalPercent, setTotalPercent] = useState(1)
	const [totalPercentNonTradeable, setTotalPercentNonTradeable] = useState(1)

	useEffect(() => {
		if (client.clientId) handleNewClient(client)
	}, [client])

	async function handleNewClient(newClient) {
		// [1.0] GET Spot Prices
		// [1.1] Format Currencies
		let currencies = {}
		newClient.holdings.forEach(({ balance }) => {
			if (balance.currency !== 'USD') currencies[balance.currency] = true
		})

		// [1.2] GET Spot Prices
		const spotPricesResponse = await Promise.all([
			...Object.keys(currencies).map(holding => getSpotPrice(holding)),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1D')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1W')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1M')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '3M')),
			...Object.keys(currencies).map(c => getSpotPrice(c, 'YTD')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1Y'))
		])

		// [1.3] Format Spot Prices
		let newSpotPrices = { USD: 1, 'USD-1D': 1, 'USD-1W': 1, 'USD-1M': 1, 'USD-3M': 1, 'USD-YTD': 1, 'USD-1Y': 1 }
		spotPricesResponse.forEach(newSpotPrice => (newSpotPrices = { ...newSpotPrice, ...newSpotPrices }))

		// [2.0] Separate Tradeable and NonTradeable Accounts
		let newHoldings = []
		let newHoldingsNonTradeable = []
		newClient.holdings.forEach(holding => {
			if (holding.type !== 'vault' && holding.balance.currency !== 'ETH2') newHoldings.push(holding)
			else newHoldingsNonTradeable.push(holding)
		})

		// [3.0] Calculate Tradeable Total Balance and NonTradeable Total Balance
		let newTotalBalance = 0
		let newTotalBalanceNonTradeable = 0
		newHoldings.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			newTotalBalance += newBalance
			newHoldings[index].nativeBalance = newBalance
		})
		newHoldingsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			newTotalBalanceNonTradeable += newBalance
			newHoldingsNonTradeable[index].nativeBalance = newBalance
		})

		// [4.0] Calculate Tradeable Total Percent and NonTradeable Total Percent
		let newTotalPercent = 0
		let newTotalPercentNonTradeable = 0
		newHoldings.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			const percent = Number(newBalance / newTotalBalance)
			newTotalPercent += percent
			newHoldings[index].nativePercent = percent
		})
		newHoldingsNonTradeable.forEach(({ balance }, index) => {
			const newBalance = newSpotPrices[balance.currency] * balance.amount
			const percent = Number(newBalance / newTotalBalanceNonTradeable)
			newTotalPercentNonTradeable += percent
			newHoldingsNonTradeable[index].nativePercent = percent
		})

		// [5.0] Sort Accounts by Native Percent
		newHoldings = newHoldings.sort((a, b) => b.nativePercent - a.nativePercent)
		newHoldingsNonTradeable = newHoldingsNonTradeable.sort((a, b) => b.nativePercent - a.nativePercent)

		// [6.0] Update State
		setHoldings(newHoldings)
		setHoldingsNonTradeable(newHoldingsNonTradeable)
		setSpotPrices(newSpotPrices)
		setTotalBalance(newTotalBalance)
		setTotalBalanceNonTradeable(newTotalBalanceNonTradeable)
		setTotalPercent(newTotalPercent)
		setTotalPercentNonTradeable(newTotalPercentNonTradeable)
	}

	function renderHolding({ balance, currency, id, nativeBalance, nativePercent }) {
		return (
			<tr key={`Holding ${id}`}>
				<td className='Bold AlignRight'>{formatPercent(nativePercent)}</td>
				<td className='AlignRight'>{formatUSD(nativeBalance)}</td>
				<td className='Bold'>
					{balance.currency !== 'USD' ? (
						<a
							href={`https://coinbase.com/price/${coinbaseTokenNames[balance.currency]
								.replace(/ /g, '-')
								.toLowerCase()}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{balance.currency}
						</a>
					) : (
						balance.currency
					)}
				</td>
				<td>{currency ? currency.name : coinbaseTokenNames[balance.currency]}</td>
				<td>{balance.amount}</td>
				<td className='AlignRight'>{formatUSD(spotPrices[balance.currency] || 0)}</td>
				{renderHoldingPercentDifference(balance.currency, '1D')}
				{renderHoldingPercentDifference(balance.currency, '1W')}
				{renderHoldingPercentDifference(balance.currency, '1M')}
				{renderHoldingPercentDifference(balance.currency, '3M')}
				{renderHoldingPercentDifference(balance.currency, 'YTD')}
				{renderHoldingPercentDifference(balance.currency, '1Y')}
			</tr>
		)
	}

	function renderHoldingPercentDifference(holding, timePeriod) {
		if (holding === 'USD') return <td />

		const diff = (spotPrices[holding] - spotPrices[`${holding}-${timePeriod}`]) / spotPrices[`${holding}-${timePeriod}`]

		if (diff < 0) return <td className='AlignRight Red'>{formatPercent(diff)}</td>
		else return <td className='AlignRight Green'>+{formatPercent(diff)}</td>
	}

	return (
		<>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Current Holdings</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>PERCENT</th>
						<th className='AlignRight'>BALANCE</th>
						<th>HOLDING</th>
						<th>NAME</th>
						<th>AMOUNT</th>
						<th>SPOT PRICE</th>
						<th className='AlignRight Break'>1D</th>
						<th className='AlignRight'>1W</th>
						<th className='AlignRight'>1M</th>
						<th className='AlignRight'>3M</th>
						<th className='AlignRight'>YTD</th>
						<th className='AlignRight'>1Y</th>
					</tr>
				</thead>
				<tbody>{holdings.map(renderHolding)}</tbody>
				<tfoot>
					<tr>
						<td className='AlignRight Bold'>{formatPercent(totalPercent)}</td>
						<td className='AlignRight Bold'>{formatUSD(totalBalance)}</td>
						<td>{holdings.length} Total</td>
					</tr>
				</tfoot>
			</table>
			{totalBalanceNonTradeable ? (
				<table>
					<caption>
						<div className='Flex'>
							<div className='Title'>Current Non-Tradeable Holdings</div>
						</div>
					</caption>
					<thead>
						<tr>
							<th>PERCENT</th>
							<th className='AlignRight'>BALANCE</th>
							<th>HOLDING</th>
							<th>NAME</th>
							<th>AMOUNT</th>
							<th>SPOT PRICE</th>
							<th className='AlignRight Break'>1D</th>
							<th className='AlignRight'>1W</th>
							<th className='AlignRight'>1M</th>
							<th className='AlignRight'>3M</th>
							<th className='AlignRight'>YTD</th>
							<th className='AlignRight'>1Y</th>
						</tr>
					</thead>
					<tbody>{holdingsNonTradeable.map(renderHolding)}</tbody>
					<tfoot>
						<tr>
							<td className='AlignRight Bold'>{formatPercent(totalPercentNonTradeable)}</td>
							<td className='AlignRight Bold'>{formatUSD(totalBalanceNonTradeable)}</td>
							<td>{holdings.length} Total</td>
						</tr>
					</tfoot>
				</table>
			) : null}
		</>
	)
}

export default ClientHoldings
