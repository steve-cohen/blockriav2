import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Text } from 'recharts'
import emailjs from '@emailjs/browser'
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
	const [isLoading, setIsLoading] = useState(false)
	const [isResent, setIsResent] = useState([])
	const [pendingInvites, setPendingInvites] = useState([])

	const [performance, setPerformance] = useState([{ date: yesterday.toISOString().slice(0, 10), TotalBalance: 0 }])
	const [tableHeaders, setTableHeaders] = useState([])
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceDate, setTotalBalanceDate] = useState(
		yesterday.toLocaleString('en-us', { year: 'numeric', month: 'short', day: 'numeric' })
	)

	useEffect(() => {
		GETPendingInvites()
		GETPerformance()
	}, [])

	function createAuthorizationLink(email) {
		let url = 'https://blockria.com/client/sign?'
		url += `email=${email}`
		url += `&firmName=${advisor.idToken.payload['custom:firm_name']}`
		url += `&advisorName=${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`
		url += `&advisorId=${advisor.idToken.payload.sub}`
		return url
	}

	async function GETPendingInvites() {
		await fetch(`https://blockria.com/api/invites?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newPendingInvites => {
				newPendingInvites = newPendingInvites.sort((a, b) => b.clientEmailLastSent - a.clientEmailLastSent)

				let newIsResent = []
				for (let i = 0; i < newPendingInvites.length; i++) newIsResent.push(false)
				setIsResent(newIsResent)
				setPendingInvites(newPendingInvites)
			})
			.catch(alert)
	}

	async function GETPerformance() {
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
					performanceDay.TotalBalance = Number(dayTotalBalance.toFixed(2))

					newPerformance.push(performanceDay)
				})
				newPerformance = newPerformance.sort(
					(a, b) => Number(a.date.replace(/-/g, '')) - Number(b.date.replace(/-/g, ''))
				)

				console.log(newPerformance)

				// Add an Initial $0.00 Data Point for the Graph
				let startingPerformance = new Date(newPerformance[0].date)
				startingPerformance = startingPerformance.setDate(startingPerformance.getDate() - 1)
				startingPerformance = new Date(startingPerformance).toISOString().slice(0, 10)
				newPerformance.unshift({ date: startingPerformance, TotalBalance: 0 })

				// Set Data
				setPerformance(newPerformance)
				setTableHeaders(Object.keys(newTableHeaders).sort())
				setTotalBalance(newPerformance[newPerformance.length - 1].TotalBalance)
				formatTotalBalanceDate(newPerformance[newPerformance.length - 1].date)
			})
			.catch(alert)
	}

	function formatTotalBalanceDate(date) {
		const YYYMMDD = date.split('-')

		const months = {
			'01': 'January',
			'02': 'February',
			'03': 'March',
			'04': 'April',
			'05': 'May',
			'06': 'June',
			'07': 'July',
			'08': 'August',
			'09': 'September',
			10: 'October',
			11: 'November',
			12: 'December'
		}

		setTotalBalanceDate(`${months[YYYMMDD[1]]} ${Number(YYYMMDD[2])}, ${YYYMMDD[0]}`)
	}

	async function handleDelete(e, { clientEmailAddress }) {
		if (isLoading) return

		const deleteParams = { advisorId: advisor.idToken.payload.sub, clientEmailAddress }

		await fetch('https://blockria.com/api/invites', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(deleteParams)
		})

		await GETPendingInvites()
	}

	function renderPendingInvite(pendingInvite, index) {
		const day = 24 * 60 * 60 * 1000 // hours * minutes * seconds * milliseconds
		const today = new Date()
		const lastSent = new Date(pendingInvite.clientEmailLastSent)
		const daysSince = Math.round((today - lastSent) / day)

		return (
			<tr key={`Client Email ${pendingInvite.clientEmailAddress}`}>
				<td>{pendingInvite.clientEmailAddress}</td>
				<td>{daysSince ? (daysSince === 1 ? '1 Day Ago' : `${daysSince} Days Ago`) : 'Today'}</td>
				{isResent[index] ? (
					<td className='Bold'>Sent</td>
				) : (
					<td className='Blue' onClick={e => resendEmail(e, pendingInvite, index)} style={{ fontWeight: 500 }}>
						Resend Email
					</td>
				)}
				<td className='Red' onClick={e => handleDelete(e, pendingInvite)}>
					Delete
				</td>
			</tr>
		)
	}

	function renderPerformance(performanceDay) {
		return (
			<tr key={`Performance Day ${performanceDay.date}`}>
				<td>{performanceDay.date}</td>
				<td className='AlignRight Bold'>{formatUSD(performanceDay.TotalBalance)}</td>
				{tableHeaders.map((token, index) => {
					if (token in performanceDay) {
						return (
							<td className='AlignRight' key={`Performance Token ${token}`}>
								{formatUSD(performanceDay[token])}
							</td>
						)
					} else {
						return (
							<td className='AlignRight' key={`Performance Token ${index}`}>
								$0.00
							</td>
						)
					}
				})}
				<td />
			</tr>
		)
	}

	async function resendEmail(e, { clientEmailAddress, clientEmailMessage, clientEmailSubject }, index) {
		e.preventDefault()
		setIsLoading(true)

		// [0.0]
		let newIsResent = [...isResent]
		newIsResent[index] = true
		setIsResent(newIsResent)

		// [1.0] Send Email
		const templateParams = {
			advisorName: `${advisor.idToken.payload.given_name} ${advisor.idToken.payload.family_name}`,
			email: clientEmailAddress,
			message: decodeURIComponent(clientEmailMessage)
				.replace(
					'{{Authorization Link}}',
					`<a href='${createAuthorizationLink(clientEmailAddress)}'>Authorization Link</a>`
				)
				.replace(/\n/g, '<br>'),
			subject: clientEmailSubject
		}

		await emailjs
			.send('service_1zzl4ah', 'template_zpo8s53', templateParams, 'joD1A0qHJYnXOOY4z')
			.then(console.log)
			.catch(alert)

		// [2.0] Save Records
		const inviteOptions = {
			advisorId: advisor.idToken.payload.sub,
			clientEmailAddress,
			clientEmailLastSent: Date.now(),
			clientEmailMessage,
			clientEmailSubject
		}
		await fetch('https://blockria.com/api/invites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(inviteOptions)
		})

		setIsLoading(false)
	}

	return (
		<div className='Overview'>
			{/* <table style={{ marginBottom: '60px' }}>
				<caption>
					<div className='Flex'>
						<Link className='Button' to={`/advisor/invites`}>
							Invite Client
						</Link>
					</div>
				</caption>
			</table> */}
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>
							{formatUSD(totalBalance)}
							{' Total Balance - Beginning '}
							{totalBalanceDate}
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
						<YAxis dataKey='TotalBalance' orientation='right' />
						<Tooltip className='ToolTip' isAnimationActive={false} />
						<Text />
						<Area
							dataKey='TotalBalance'
							fill='url(#Area)'
							isAnimationActive={false}
							stroke='rgb(18, 25, 44)'
							type='monotone'
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<table className='PendingInvites'>
				<caption>
					<div className='Flex'>
						<div className='Title'>Pending Invites</div>
						<Link className='Button' to={`/advisor/invites`}>
							Invite Client
						</Link>
					</div>
				</caption>
				<thead>
					<tr>
						<th className='Break'>EMAIL</th>
						<th>SENT</th>
						<th>RESEND</th>
						<th>DELETE</th>
					</tr>
				</thead>
				<tbody>{pendingInvites.map((pendingInvite, index) => renderPendingInvite(pendingInvite, index))}</tbody>
				<tfoot>
					<tr>
						<td>{pendingInvites.length} Total</td>
					</tr>
				</tfoot>
			</table>
			<table className='TotalBalanceHistory'>
				<caption>
					<div className='Flex'>
						<div className='Title'>Daily Balance History</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>DATE</th>
						<th className='AlignRight'>TOTAL BALANCE</th>
						{tableHeaders.map(token => (
							<th className='AlignRight' key={`Table Header Token ${token}`}>
								TOTAL {token}
							</th>
						))}
						<th className='Break' />
					</tr>
				</thead>
				<tbody>{[...performance].reverse().map(renderPerformance)}</tbody>
			</table>
		</div>
	)
}

export default Overview
