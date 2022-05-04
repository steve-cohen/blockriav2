import React, { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Text } from 'recharts'
import './Overview.css'

let yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Overview = ({ advisor }) => {
	const [performance, setPerformance] = useState([{ date: yesterday.toISOString().slice(0, 10), totalBalance: 0 }])
	const [tableHeaders, setTableHeaders] = useState([])
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceDate, setTotalBalanceDate] = useState(yesterday)

	useEffect(async () => {
		await fetch(`https://blockria.com/api/overview?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(response => {
				if (response.Item === undefined) return
				if (response.Item.advisorId) delete response.Item.advisorId
				if (!Object.keys(response.Item).length) return

				// Destructure DynamoDB into [ { date: '2022-05-03', token1: 9.84, token2: 3.21, totalBalance: 17.81 }, ...]
				let newPerformance = []
				let newTableHeaders = {}
				Object.entries(response.Item).forEach(([date, holdings]) => {
					let performanceDay = { date }

					let dayTotalBalance = 0
					Object.entries(holdings.M).forEach(([token, amount]) => {
						performanceDay[token] = Number(amount.N)
						dayTotalBalance += Number(amount.N)

						newTableHeaders[token] = true
					})
					performanceDay.totalBalance = dayTotalBalance

					newPerformance.push(performanceDay)
				})
				newPerformance = newPerformance.sort(
					(a, b) => Number(a.date.replace(/-/g, '')) - Number(b.date.replace(/-/g, ''))
				)

				console.log(newPerformance)
				console.log(Object.keys(newTableHeaders).sort())

				// Set Data
				setPerformance(newPerformance)
				setTableHeaders(Object.keys(newTableHeaders).sort())
				setTotalBalance(newPerformance[newPerformance.length - 1].totalBalance)
				setTotalBalanceDate(new Date(newPerformance[newPerformance.length - 1].date))
			})
			.catch(alert)
	}, [])

	function renderPerformance(performanceDay) {
		return (
			<tr key={`Performance Day ${performanceDay.date}`}>
				<td>{performanceDay.date}</td>
				<td className='AlignRight Bold'>{formatUSD(performanceDay.totalBalance)}</td>
				<td />
				{tableHeaders.map((token, index) => {
					if (token in performanceDay) {
						return (
							<td className='AlignRight' key={`Performance Token ${token}`}>
								{formatUSD(performanceDay[token])}
							</td>
						)
					} else {
						return <td key={`Performance Token ${index}`}>$0.00</td>
					}
				})}
			</tr>
		)
	}

	return (
		<div className='Overview'>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>
							{formatUSD(totalBalance)}
							{' Total Balance on '}
							{totalBalanceDate.toLocaleDateString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })}
						</div>
					</div>
				</caption>
			</table>
			<div className='AreaChart'>
				<ResponsiveContainer width='100%' height='100%'>
					<AreaChart data={performance}>
						<defs>
							<linearGradient id='Area' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='10%' stopColor='rgb(18, 25, 44)' stopOpacity={0.2} />
								<stop offset='90%' stopColor='rgb(18, 25, 44)' stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis dataKey='date' />
						<YAxis dataKey='totalBalance' orientation='right' />
						<Tooltip className='ToolTip' />
						<Text />
						<Area type='monotone' dataKey='totalBalance' stackId='1' stroke='rgb(18, 25, 44)' fill='url(#Area)' />
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<table className='TotalBalanceHistory'>
				<caption>
					<div className='Flex'>
						<div className='Title'>Total Balance History</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>DATE</th>
						<th className='AlignRight'>TOTAL BALANCE</th>
						<th className='Break' />
						{tableHeaders.map(token => (
							<th className='AlignRight' key={`Table Header Token ${token}`}>
								TOTAL {token}
							</th>
						))}
					</tr>
				</thead>
				<tbody>{[...performance].reverse().map(renderPerformance)}</tbody>
			</table>
		</div>
	)
}

export default Overview
