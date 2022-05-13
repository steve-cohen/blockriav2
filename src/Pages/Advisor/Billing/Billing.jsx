import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Billing.css'

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Billing = ({ advisor }) => {
	const [billingPlans, setBillingPlans] = useState([])
	const [billingCountTotals, setBillingCountTotals] = useState({})

	useEffect(() => {
		fetch(`https://blockria.com/api/billing?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(setBillingPlans)
			.catch(alert)

		fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisor.idToken.payload.sub}`)
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
	}, [])

	function renderBillingPlans({
		billingAmount,
		billingId,
		billingName,
		billingPlatformFee,
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
					{renderBillingAmount} / mo
				</td>
				{/* <td className='AlignRight' style={{ textTransform: 'none' }}>
					{billingPlatformFee} bps / mo
				</td> */}
				<td className='AlignRight Bold'>
					{billingCountTotals[billingId] !== 1
						? `${billingCountTotals[billingId] || 0} Clients`
						: `${billingCountTotals[billingId]} Client`}
				</td>
				<td className='Bold'>
					<Link to={`/advisor/billing/edit?billingId=${billingId}`}>Edit Billing Plan</Link>
				</td>
				<td>{new Date(billingUpdatedAt).toISOString().slice(0, 10)}</td>
			</tr>
		)
	}

	return (
		<div className='Billing'>
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
				<tbody>{billingPlans.map(renderBillingPlans)}</tbody>
				<tfoot>
					<tr>
						<td colSpan={6}>
							<Link to='/advisor/billing/edit'>+ Create Billing Plan</Link>
						</td>
					</tr>
				</tfoot>
			</table>
			<table>
				<caption>
					<div className='Flex'>
						<div className='Title'>Billing CSVs</div>
					</div>
				</caption>
				<thead>
					<tr>
						<th>START DATE</th>
						<th>END DATE</th>
						<th className='Break'>TOTAL FEES</th>
						<th>EXPORT</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	)
}

export default Billing
