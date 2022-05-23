import React, { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import { Link } from 'react-router-dom'

const renderMonths = {
	'01': 'Jan',
	'02': 'Feb',
	'03': 'Mar',
	'04': 'Apr',
	'05': 'May',
	'06': 'Jun',
	'07': 'Jul',
	'08': 'Aug',
	'09': 'Sep',
	10: 'Oct',
	11: 'Nov',
	12: 'Dec'
}

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Billing = ({ advisor }) => {
	const [billingCountTotals, setBillingCountTotals] = useState({})
	const [billingPlans, setBillingPlans] = useState([])
	const [billingHistory, setBillingHistory] = useState([])
	const [billingHistoryClients, setBillingHistoryClients] = useState({})
	const [isLoading, setIsLoading] = useState(true)

	useEffect(async () => {
		await Promise.all([GETBillingPlans(), GETBillingCountTotals(), GETBillingHistory()])
		setIsLoading(false)
	}, [])

	function GETBillingPlans() {
		return fetch(`https://blockria.com/api/billing?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(setBillingPlans)
			.catch(alert)
	}

	function GETBillingCountTotals() {
		return fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(clients => {
				let newBillingCountTotals = {}
				clients.forEach(({ billingId }) => {
					if (billingId in newBillingCountTotals) newBillingCountTotals[billingId] += 1
					else newBillingCountTotals[billingId] = 1
				})
				setBillingCountTotals(newBillingCountTotals)
			})
			.catch(alert)
	}

	function GETBillingHistory() {
		return fetch(`https://blockria.com/api/billinghistory?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(formatBillingHistory)
			.catch(alert)
	}

	function formatBillingHistory(newBillingHistory) {
		// [1.0] Format Data
		// months = { [month] : [clientId] : { feeAdvisorUSDSum: 0, dayCount: 0 } }
		let months = {}

		newBillingHistory.forEach(({ date_clientId, clientName, feeAdvisorUSD }) => {
			const [date, clientId] = date_clientId.S.split('_')
			const month = date.slice(0, 7)

			if (!(month in months)) months[month] = {}
			if (!(clientId in months[month])) months[month][clientId] = { feeAdvisorUSDSum: 0, dayCount: 0 }

			months[month][clientId].clientName = clientName.S
			months[month][clientId].dayCount += 1
			months[month][clientId].feeAdvisorUSDSum += Number(feeAdvisorUSD.N)
		})

		// [2.0] Calculate Advisor's Fee for Each Client for Each Month (Average of Daily Fees for Each Month)
		// feeAdvisorUSDMonth = (Total Advisor Fees) / (Number of Days)
		// months = { [month] : [clientId] : { feeAdvisorUSDSum: 0, dayCount: 0, feeAdvisorUSDMonth: 0 } }
		// feeAdvisorUSDMonth = { [month]: feeAdvisorUSDTotal }
		let feeAdvisorUSDMonth = {}
		Object.entries(months).forEach(([month, monthData]) => {
			Object.entries(monthData).forEach(([clientId, { feeAdvisorUSDSum, dayCount }]) => {
				const clientFee = Number((feeAdvisorUSDSum / dayCount).toFixed(2))

				months[month][clientId].feeAdvisorUSDMonth = clientFee

				if (!(month in feeAdvisorUSDMonth)) feeAdvisorUSDMonth[month] = 0
				feeAdvisorUSDMonth[month] += clientFee
			})
		})
		console.log(months)
		console.log(feeAdvisorUSDMonth)

		// [3.0] Calculate Number of Clients in Each Month
		// clientCounts = { [month] : { [clientId] : true } }
		let clientCounts = {}
		newBillingHistory.forEach(({ date_clientId }) => {
			const clientId = date_clientId.S.split('_')[1]
			const month = date_clientId.S.slice(0, 7)

			if (!(month in clientCounts)) clientCounts[month] = {}

			clientCounts[month][clientId] = true
		})
		console.log(clientCounts)

		// [4.0] Format Billing History
		let newBillings = {}
		Object.entries(feeAdvisorUSDMonth).forEach(([month, feeAdvisorUSDTotal]) => {
			newBillings[month] = { feeAdvisorUSDTotal }
		})
		Object.entries(clientCounts).forEach(([month, clients]) => {
			newBillings[month].clientCount = Object.keys(clients).length
		})
		console.log(newBillings)

		// [5.0] Set State
		setBillingHistoryClients(months)
		setBillingHistory(Object.entries(newBillings).sort((a, b) => b[0] - a[0]))
	}

	function renderBillingPlans({
		billingAmount,
		billingId,
		billingName,
		// billingPlatformFee,
		billingType,
		billingUpdatedAt
	}) {
		let renderBillingAmount = `${billingAmount} bps`
		if (billingType === 'Fixed') renderBillingAmount = formatUSD(billingAmount)

		return (
			<tr key={`Billing Plan ${billingId}`}>
				<td className='Bold'>{billingName}</td>
				<td>{billingType}</td>
				<td className='AlignRight' style={{ textTransform: 'none' }}>
					{renderBillingAmount} {billingType === 'Assets Under Management' ? '/ yr' : '/ mo'}
				</td>
				{/* <td className='AlignRight' style={{ textTransform: 'none' }}>
					{billingPlatformFee} bps / yr
				</td> */}
				<td className='AlignRight Bold'>
					{billingCountTotals[billingId] !== 1
						? `${billingCountTotals[billingId] || 0} Clients`
						: `${billingCountTotals[billingId]} Client`}
				</td>
				<td className='Bold'>
					<Link to={`/advisor/billing/edit?billingId=${billingId}`}>Edit Billing Plan</Link>
				</td>
				<td>{new Date(Number(billingUpdatedAt)).toISOString().slice(0, 10)}</td>
			</tr>
		)
	}

	function renderBillingHistory([month, monthBillingHistory]) {
		let renderClientCount = monthBillingHistory.clientCount + ' Client'
		if (monthBillingHistory.clientCount !== 1) renderClientCount += 's'

		return (
			<tr key={`Billing History ${month}`}>
				<td className='Bold'>
					{month.slice(0, 4)} {renderMonths[month.slice(5, 7)]}
				</td>
				<td className='AlignRight Bold'>{formatUSD(monthBillingHistory.feeAdvisorUSDTotal)}</td>
				<td className='AlignRight'>{renderClientCount}</td>
				<td className='AlignRight Bold'>{renderExportCSV(month)}</td>
			</tr>
		)
	}

	function renderExportCSV(month) {
		const firstName = advisor.idToken.payload.family_name
		const lastName = advisor.idToken.payload.given_name
		const fileName = `BlockRIA-Billing-${month}-${lastName}-${firstName}.csv`

		const headers = ['Client', 'Fee ($)']

		console.log(billingHistoryClients, month)
		const data = Object.entries(billingHistoryClients[month]).map(([, { clientName, feeAdvisorUSDMonth }]) => {
			return { Client: clientName, 'Fee ($)': feeAdvisorUSDMonth }
		})

		return (
			<CSVLink data={data} enclosingCharacter={''} filename={fileName} headers={headers}>
				Export CSV
			</CSVLink>
		)
	}

	return (
		<div className='Billing'>
			<div className='ResponsiveTable'>
				<table>
					<caption>
						<div className='Flex'>
							<div className='Title'>Billing Plans</div>
							<Link className='Button' to='/advisor/billing/edit'>
								Create Billing Plan
							</Link>
						</div>
					</caption>
					<thead>
						<tr style={{ whiteSpace: 'nowrap' }}>
							<th>NAME</th>
							<th>TYPE</th>
							<th className='AlignRight'>FIRM FEE</th>
							{/* <th className='AlignRight'>PLATFORM FEE</th> */}
							<th className='AlignRight Break'>ASSIGNED TO</th>
							<th>EDIT</th>
							<th>LAST EDIT</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td style={{ border: 'none' }}>
									<div className='Loading'>Loading...</div>
								</td>
							</tr>
						) : (
							billingPlans.map(renderBillingPlans)
						)}
					</tbody>
					<tfoot>
						<tr>
							<td colSpan={6}>
								<Link to='/advisor/billing/edit'>+ Create Billing Plan</Link>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<div className='ResponsiveTable'>
				<table>
					<caption>
						<div className='Flex'>
							<div className='Title'>Billing CSVs</div>
						</div>
					</caption>
					<thead>
						<tr style={{ whiteSpace: 'nowrap' }}>
							<th>MONTH</th>
							<th className='AlignRight'>ADVISOR FEES</th>
							<th className='AlignRight'>CLIENTS</th>
							<th className='AlignRight Break'>EXPORT</th>
						</tr>
					</thead>
					<tbody>{billingHistory.map(renderBillingHistory)}</tbody>
				</table>
			</div>
		</div>
	)
}

export default Billing
