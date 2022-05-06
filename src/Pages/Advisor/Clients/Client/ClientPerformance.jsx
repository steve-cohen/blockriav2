import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const timePeriods = ['YTD', '1D', '1W', '1M', '3M', '1Y', 'ALL']

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

function formatPercent(number) {
	return (number / 100).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'percent'
	})
}

function GETSpotPrice(holding, startDate) {
	return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot?date=${startDate}`)
		.then(response => response.json())
		.then(response => Number(response.data.amount))
		.catch(alert)
}

const ClientPerformance = ({ totalBalance, totalBalanceNonTradeable, transactions }) => {
	console.log(transactions)

	const [searchParams] = useSearchParams()
	const [performances, setPerformances] = useState([])

	useEffect(async () => {
		const newPerformances = await Promise.all(timePeriods.map(calculatePerformance))
		setPerformances(newPerformances)
	}, [transactions])

	async function calculatePerformance(timePeriod) {
		// [1.0] Calculate Time Period
		let startDate = new Date()
		switch (timePeriod) {
			case '1D':
				startDate.setDate(startDate.getDate() - 1)
				break
			case '1W':
				startDate.setDate(startDate.getDate() - 7)
				break
			case '1M':
				startDate.setMonth(startDate.getMonth() - 1)
				break
			case '3M':
				startDate.setMonth(startDate.getMonth() - 3)
				break
			case 'YTD':
				startDate.setDate(1)
				startDate.setMonth(0)
				break
			case '1Y':
				startDate.setFullYear(startDate.getFullYear() - 1)
				break
			case 'ALL':
				startDate.setDate(0)
				startDate.setMonth(0)
				startDate.setYear(0)
				break
			default:
				return null
		}

		startDate = startDate.toISOString().slice(0, 10)
		const endDate = new Date().toISOString().slice(0, 10)

		// [2.0] Calculate Net Contributions within Time Period
		let netContributions = 0
		let netDeposits = 0
		let netWithdrawals = 0

		for (let i = 0; i < transactions.length; i++) {
			let { details, native_amount, type, updated_at } = transactions[i]
			if (startDate > updated_at.slice(0, 10) || updated_at.slice(0, 10) > endDate) break

			switch (type) {
				case 'buy':
					if (details.payment_method_name !== 'Cash (USD)') netDeposits += native_amount.amount
					break
				case 'fiat_deposit':
					netDeposits += native_amount.amount
					break
				case 'fiat_withdrawal':
					netWithdrawals += native_amount.amount
					break
				case 'send':
					if (native_amount.amount > 0) netDeposits += native_amount.amount
					else netWithdrawals += native_amount.amount
				default:
					break
			}
		}

		netContributions = netDeposits + netWithdrawals

		// [3.0] Calculate Earnings
		// [3.1] Calculate Token Amounts at Start Date
		let startingTokens = {}
		for (let i = transactions.length - 1; i >= 0; i--) {
			let { amount, updated_at } = transactions[i]
			if (startDate < updated_at.slice(0, 10)) break

			if (amount && amount.amount && amount.currency) {
				if (startingTokens[amount.currency]) startingTokens[amount.currency] += amount.amount
				else startingTokens[amount.currency] = amount.amount
			}
		}
		startingTokens = Object.entries(startingTokens)

		// [3.2] Calculate Total Balance at Start Date
		let startingBalance = 0
		for (let i = 0; i < startingTokens.length; i++) {
			const [token, amount] = startingTokens[i]

			let spotPrice = 1
			if (token !== 'USD' && amount !== 0) spotPrice = await GETSpotPrice(token, startDate)

			startingBalance += amount * spotPrice
		}

		return {
			netContributions,
			netDeposits,
			netWithdrawals,
			startingBalance,
			timePeriod
		}
	}

	function renderPerformance({ netContributions, netDeposits, netWithdrawals, startingBalance, timePeriod }) {
		const endBalance = totalBalance + totalBalanceNonTradeable
		const performanceDollars = endBalance - netContributions - startingBalance
		const performancePercent =
			(endBalance - (startingBalance + netContributions)) / (startingBalance + netContributions)
		// const performancePercent = (endBalance - startingBalance) / startingBalance

		return (
			<tr
				key={`Performance ${timePeriod}`}
				className={timePeriod === 'YTD' ? 'Bold' : ''}
				style={timePeriod === 'YTD' ? { background: 'rgb(243, 244, 246)' } : {}}
			>
				<td className='Bold'>{timePeriod}</td>
				<td className='AlignRight'>{formatUSD(startingBalance)}</td>
				<td className='AlignRight Green'>+{formatUSD(netDeposits)}</td>
				<td className={`AlignRight ${netContributions === 0 ? 'Green' : 'Red'}`}>{formatUSD(netWithdrawals)}</td>
				{netContributions >= 0 ? (
					<td className='AlignRight Green'>+{formatUSD(netContributions)}</td>
				) : (
					<td className='AlignRight Red'>{formatUSD(netContributions)}</td>
				)}
				{endBalance >= 0 ? (
					<td className='AlignRight Green'>+{formatUSD(endBalance)}</td>
				) : (
					<td className='AlignRight Red'>{formatUSD(endBalance)}</td>
				)}
				{performanceDollars >= 0 ? (
					<td className='AlignRight Green'>+{formatUSD(performanceDollars)}</td>
				) : (
					<td className='AlignRight Red'>{formatUSD(performanceDollars)}</td>
				)}
				{performancePercent >= 0 ? (
					<td className='AlignRight Green'>+{formatPercent(performancePercent)}</td>
				) : (
					<td className='AlignRight Red'>{formatPercent(performancePercent)}</td>
				)}
			</tr>
		)
	}

	return (
		<table>
			<caption>
				<div className='Flex'>
					<div className='Title'>Performance for {searchParams.get('clientName')}</div>
				</div>
			</caption>
			<thead>
				<tr>
					<th>TIME PERIOD</th>
					<th className='AlignRight'>STARTING BALANCE</th>
					<th className='AlignRight'>DEPOSITS</th>
					<th className='AlignRight'>WITHDRAWALS</th>
					<th className='AlignRight'>NET CONTRIBUTIONS</th>
					<th className='AlignRight'>ENDING BALANCE</th>
					{/* <th className='AlignRight'>EARNINGS</th> */}
					<th className='AlignRight'>PERFORMANCE ($)</th>
					<th className='AlignRight'>PERFORMANCE (%)</th>
				</tr>
			</thead>
			<tbody>{performances.map(renderPerformance)}</tbody>
			<tfoot></tfoot>
		</table>
	)
}

export default ClientPerformance
