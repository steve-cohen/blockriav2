import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './Clients.css'

let spotPrices = { USD: 1 }

function formatUSD(number) {
	return number.toLocaleString('en-US', {
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
		return []
		// return fetch(`https://blockria.com/api/coinbasepro/clients?advisorId=${advisorId}`)
		// 	.then(response => response.json())
		// 	.catch(alert)
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
	function GETSpotPrice(holding) {
		return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot`)
			.then(response => response.json())
			.catch(error => alert(error))
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
			holdings.forEach(({ balance }) => (endingBalance += spotPrices[balance.currency] * balance.amount))
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
		const spotPricesResponse = await Promise.all(Object.keys(currencies).map(GETSpotPrice))

		// [1.3] Format Spot Prices
		spotPricesResponse.forEach(({ data }) => (spotPrices[data.base] = Number(data.amount)))

		// [2.0] Calculate Total Native Balance for Each Client
		let newTotalBalance = 0
		newClients.forEach(({ holdings }, index) => {
			let nativeBalance = 0
			holdings.forEach(({ balance }) => (nativeBalance += spotPrices[balance.currency] * balance.amount))
			newClients[index].nativeBalance = nativeBalance

			newTotalBalance += nativeBalance
		})

		// [3.0] Sort Clients by Total Native Balance
		newClients = newClients.sort((a, b) => b.nativeBalance - a.nativeBalance)

		// [5.0] Update State
		setTotalBalance(formatUSD(newTotalBalance))

		return newClients
	}

	function renderClient({
		billingId,
		clientEmail,
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
				{/* <td style={{ textTransform: 'lowercase' }}>{clientEmail}</td> */}
				<td>{clientId.includes('-') ? 'Coinbase' : 'Coinbase Pro'}</td>
				<td>{new Date(createdAt).toISOString().slice(0, 10)}</td>
			</tr>
		)
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
							<div className='Title'>{clients.length !== 1 ? `${clients.length} Clients` : '1 Client'}</div>
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
							<th>PORTFOLIO REBALANCING</th>
							<th className='Break'>BILLING PLAN</th>
							{/* <th>EMAIL</th> */}
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
		</>
	)
}

export default Clients
