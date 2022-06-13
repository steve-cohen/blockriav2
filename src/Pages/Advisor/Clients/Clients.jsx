import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import coinbaseTokenNames from '../coinbaseTokenNames.json'
import './Clients.css'

let spotPrices = { USD: 1 }
const timePeriods = ['', '1D', '1W', '1M', '3M', 'YTD', '1Y']

function formatPercent(number) {
	return Number(number).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'percent'
	})
}

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Clients = ({ advisor }) => {
	const navigate = useNavigate()
	const advisorId = advisor.idToken.payload.sub

	const [billingPlans, setBillingPlans] = useState({})
	const [clients, setClients] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [performance, setPerformance] = useState([])
	const [portfolios, setPortfolios] = useState({})
	const [totalBalance, setTotalBalance] = useState('$0.00')
	const [totalBalanceTitle, setTotalBalanceTitle] = useState('')
	const [totalHoldings, setTotalHoldings] = useState([])

	useEffect(async () => {
		const [clients, performance] = await Promise.all([
			GETClients(),
			GETPerformance(),
			GETPortfolios(),
			GETBillingPlans()
		])
		await formatPerformance(clients, performance)
		setIsLoading(false)
	}, [])

	function GETBillingPlans() {
		return fetch(`https://blockria.com/api/billing?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(response => {
				let newBillingPlans = {}
				response.forEach(({ billingId, billingName }) => (newBillingPlans[billingId] = billingName))
				setBillingPlans(newBillingPlans)
			})
			.catch(alert)
	}

	async function GETClients() {
		const [coinbase, coinbasePro] = await Promise.all([GETClientsCoinbase(), GETClientsCoinbasePro()])
		return handleNewClients([...coinbase, ...coinbasePro])
	}

	function GETClientsCoinbase() {
		return fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisorId}`)
			.then(response => response.json())
			.catch(alert)
	}

	function GETClientsCoinbasePro() {
		// return []
		return fetch(`https://blockria.com/api/coinbasepro/clients?advisorId=${advisorId}`)
			.then(response => response.json())
			.catch(alert)
	}

	function GETPerformance() {
		return fetch(`https://blockria.com/api/overview?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(response => {
				if (response.Item === undefined) return
				if (response.Item.advisorId) delete response.Item.advisorId
				if (!Object.keys(response.Item).length) return

				// Destructure DynamoDB into [ { date: '2022-05-03', token1: 9.84, token2: 3.21, totalBalance: 17.81 }, ...]
				let newPerformance = []
				Object.entries(response.Item).forEach(([date, holdings]) => {
					let performanceDay = { date }

					let dayTotalBalance = 0
					Object.entries(holdings.M).forEach(([token, amount]) => {
						performanceDay[token] = Number(amount.N)
						dayTotalBalance += Number(amount.N)
					})
					performanceDay.TotalBalance = Number(dayTotalBalance.toFixed(2))

					newPerformance.push(performanceDay)
				})
				newPerformance = newPerformance.sort(
					(a, b) => Number(a.date.replace(/-/g, '')) - Number(b.date.replace(/-/g, ''))
				)

				// Set Data
				return newPerformance
			})
			.catch(alert)
	}

	function GETPortfolios() {
		return fetch(`https://blockria.com/api/portfolios?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(response => {
				let newPortfolios = {}
				response.forEach(({ portfolioId, portfolioName }) => (newPortfolios[portfolioId] = portfolioName))
				setPortfolios(newPortfolios)
			})
			.catch(alert)
	}

	function GETSpotPrice(holding, timePeriod) {
		let date = new Date()
		date.setHours(0)
		date.setMinutes(0)
		date.setSeconds(0)
		date.setMilliseconds(0)

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

		date = date.toISOString().slice(0, 10)

		return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot?date=${date}`)
			.then(response => response.json())
			.catch(alert)
	}

	function formatDate(date) {
		const YYYYMMDD = date.split('-')

		const months = {
			'01': 'JAN',
			'02': 'FEB',
			'03': 'MAR',
			'04': 'APR',
			'05': 'MAY',
			'06': 'JUN',
			'07': 'JUL',
			'08': 'AUG',
			'09': 'SEP',
			10: 'OCT',
			11: 'NOV',
			12: 'DEC'
		}

		return `${months[YYYYMMDD[1]]} ${YYYYMMDD[0]}`
	}

	function formatPerformance(newClients, newPerformance) {
		// Add a Starting Data Point of $0.00
		let startingPerformance = new Date(newPerformance[0].date)
		startingPerformance = startingPerformance.setDate(startingPerformance.getDate() - 1)
		startingPerformance = new Date(startingPerformance).toISOString().slice(0, 10)
		newPerformance.unshift({ date: startingPerformance, TotalBalance: 0 })

		// Add an Ending Data Point for the Current Total Balance
		let endingDate = new Date().toISOString().slice(0, 10)
		let endingBalance = 0
		newClients.forEach(({ holdings }) => {
			holdings.forEach(({ balance }) => (endingBalance += spotPrices[balance.currency] * Number(balance.amount)))
		})
		newPerformance.push({ date: endingDate, TotalBalance: endingBalance })

		setClients(newClients)
		setPerformance(newPerformance)
	}

	async function handleNewClients(newClients) {
		// [1.0] GET Spot Prices
		// [1.1] Format Currencies
		let currencies = {}
		newClients.forEach(({ holdings }) => {
			holdings.forEach(({ balance }) => {
				if (balance.currency !== 'USD') currencies[balance.currency] = true
			})
		})

		// [1.2] GET Spot Prices
		for (let i = 0; i < timePeriods.length; i++) {
			const spotPricesResponse = await Promise.all(
				Object.keys(currencies).map(currency => GETSpotPrice(currency, timePeriods[i]))
			)

			spotPricesResponse.forEach(({ data }) => {
				let key = i === 0 ? data.base : `${data.base}-${timePeriods[i]}`
				spotPrices[key] = Number(data.amount)
			})
		}

		// [2.0] Calculate Total Native Balance for Each Client
		let newTotalBalance = 0
		let newTotalHoldings = {}
		newClients.forEach(({ holdings }, index) => {
			let nativeBalance = 0
			holdings.forEach(({ balance }) => {
				nativeBalance += spotPrices[balance.currency] * Number(balance.amount)

				if (balance.currency in newTotalHoldings) {
					newTotalHoldings[balance.currency].amount += Number(balance.amount)
					newTotalHoldings[balance.currency].nativeBalance += spotPrices[balance.currency] * Number(balance.amount)
				} else {
					newTotalHoldings[balance.currency] = {
						amount: Number(balance.amount),
						nativeBalance: spotPrices[balance.currency] * Number(balance.amount)
					}
				}
			})
			newClients[index].nativeBalance = nativeBalance

			newTotalBalance += nativeBalance
		})

		// [3.0] Calculate Total Native Percent
		Object.entries(newTotalHoldings).forEach(([holding, { nativeBalance }]) => {
			newTotalHoldings[holding].nativePercent = nativeBalance / newTotalBalance
		})
		newTotalHoldings = Object.entries(newTotalHoldings).sort((a, b) => b[1].nativeBalance - a[1].nativeBalance)

		// [3.0] Sort Clients by Total Native Balance
		newClients = newClients.sort((a, b) => b.nativeBalance - a.nativeBalance)

		// [5.0] Update State
		setTotalBalance(formatUSD(newTotalBalance))
		setTotalHoldings(newTotalHoldings)

		return newClients
	}

	function renderClient({
		billingId,
		clientId,
		clientName,
		createdAt,
		nativeBalance,
		portfolioId,
		rebalanceFrequency
	}) {
		return (
			<tr
				key={clientId}
				onClick={() => navigate(`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`)}
			>
				<td className='ClientName'>{clientName}</td>
				<td className='AlignRight Bold'>{formatUSD(nativeBalance)}</td>
				<td>{portfolioId ? portfolios[portfolioId] : 'No Portfolio'}</td>
				<td>{rebalanceFrequency && `Rebalance ${rebalanceFrequency}`}</td>
				<td>{billingId && billingPlans[billingId]}</td>
				<td>{clientId.includes('-') ? 'Coinbase' : 'Coinbase Pro'}</td>
				<td>{new Date(createdAt).toISOString().slice(0, 10)}</td>
			</tr>
		)
	}

	function renderHolding([holding, { amount, nativeBalance, nativePercent }]) {
		return (
			<tr key={`Holding ${holding}`}>
				<td className='Bold AlignRight'>{formatPercent(nativePercent)}</td>
				<td className='AlignRight Bold'>{formatUSD(nativeBalance)}</td>
				<td className='Bold'>
					{holding !== 'USD' ? (
						<a
							href={`https://coinbase.com/price/${coinbaseTokenNames[holding].replace(/ /g, '-').toLowerCase()}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							{holding}
						</a>
					) : (
						holding
					)}
				</td>
				<td>{coinbaseTokenNames[holding]}</td>
				<td className='AlignRight'>{holding !== 'USD' && amount !== undefined && amount.toFixed(18)}</td>
				<td className='AlignRight'>{holding !== 'USD' && formatUSD(spotPrices[holding] || 0)}</td>
				{renderHoldingPercentDifference(holding, '1D')}
				{renderHoldingPercentDifference(holding, '1W')}
				{renderHoldingPercentDifference(holding, '1M')}
				{renderHoldingPercentDifference(holding, '3M')}
				{renderHoldingPercentDifference(holding, 'YTD')}
				{renderHoldingPercentDifference(holding, '1Y')}
			</tr>
		)
	}

	function renderHoldingPercentDifference(holding, timePeriod) {
		if (holding === 'USD') return <td />

		const diff = (spotPrices[holding] - spotPrices[`${holding}-${timePeriod}`]) / spotPrices[`${holding}-${timePeriod}`]

		if (diff < 0) return <td className='AlignRight Red'>{formatPercent(diff)}</td>
		else return <td className='AlignRight Green'>+{formatPercent(diff)}</td>
	}

	function renderToolTip({ payload }) {
		if (payload && payload.length) {
			let date = new Date(payload[0].payload.date)
			date = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timezone: 'PDT' })
			const totalBalance = formatUSD(payload[0].payload.TotalBalance)
			setTotalBalanceTitle(`${totalBalance} Total Balance on ${date}`)
		} else {
			setTotalBalanceTitle(`${totalBalance} Total Balance`)
		}

		return ''
	}

	return (
		<>
			<div className='Clients'>
				{performance.length ? (
					<>
						<table>
							<caption>
								<div className='Flex'>
									<div className='Title'>{totalBalanceTitle}</div>
								</div>
							</caption>
						</table>
						<div className='AreaChart'>
							<ResponsiveContainer width='100%' height='100%'>
								<LineChart data={performance}>
									<XAxis
										allowDuplicatedCategory={false}
										dataKey='date'
										interval='preserveStartEnd'
										margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
										ticks={[performance[0].date, performance[performance.length - 1].date]}
										tickFormatter={formatDate}
										tickLine={0}
										tickSize={5}
									/>
									<YAxis
										// axisLine={false}
										dataKey='TotalBalance'
										orientation='right'
										ticks={[0, performance[performance.length - 1].TotalBalance]}
										tickFormatter={formatUSD}
										tickLine={0}
										tickSize={1}
									/>
									<Line
										activeDot={false}
										dataKey='TotalBalance'
										dot={false}
										fillOpacity={0}
										stroke='rgb(18, 25, 44)'
										strokeWidth={1.2}
										type='monotone'
									/>
									<Tooltip className='ToolTip' content={renderToolTip} isAnimationActive={false} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					</>
				) : null}
			</div>
			<div className='ResponsiveTable'>
				<table className='Clients'>
					<caption>
						<div className='Flex'>
							<div className='Title'>{clients.length !== 1 ? `${clients.length} Clients` : '1 Client'} Total</div>
							<Link className='Button' to={`/advisor/invites`}>
								Invite Client
							</Link>
						</div>
					</caption>
					<thead>
						<tr>
							<th>NAME</th>
							<th className='AlignRight'>BALANCE</th>
							<th>PORTFOLIO</th>
							<th className='Break'>PORTFOLIO REBALANCING</th>
							<th>BILLING PLAN</th>
							<th>CUSTODIAN</th>
							<th>JOINED</th>
						</tr>
					</thead>
					{isLoading ? (
						<tbody>
							<tr>
								<td style={{ border: 'none' }}>
									<div className='Loading'>Loading...</div>
								</td>
							</tr>
						</tbody>
					) : (
						<>
							<tbody>{clients.map(renderClient)}</tbody>
							<tfoot>
								<tr>
									<td colSpan={Infinity}>
										<Link to='/advisor/invites'>+ Invite Client</Link>
									</td>
								</tr>
							</tfoot>
						</>
					)}
				</table>
			</div>
			{clients.length ? (
				<div className='ResponsiveTable'>
					<table>
						<caption>
							<div className='Flex'>
								<div className='Title'>
									{totalHoldings.length !== 1 ? `${totalHoldings.length} Holdings` : '1 Holding'} Total
								</div>
							</div>
						</caption>
						<thead>
							<tr>
								<th>PERCENT</th>
								<th className='AlignRight'>BALANCE</th>
								<th>HOLDING</th>
								<th>NAME</th>
								<th className='AlignRight'>AMOUNT</th>
								<th className='AlignRight Break'>PRICE</th>
								<th className='AlignRight'>1D</th>
								<th className='AlignRight'>1W</th>
								<th className='AlignRight'>1M</th>
								<th className='AlignRight'>3M</th>
								<th className='AlignRight'>YTD</th>
								<th className='AlignRight'>1Y</th>
							</tr>
						</thead>
						{isLoading ? (
							<tbody>
								<tr>
									<td style={{ border: 'none' }}>
										<div className='Loading'>Loading...</div>
									</td>
								</tr>
							</tbody>
						) : (
							<tbody>{totalHoldings.map(renderHolding)}</tbody>
						)}
					</table>
				</div>
			) : null}
		</>
	)
}

export default Clients
