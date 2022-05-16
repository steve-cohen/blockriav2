import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const ClientBilling = ({ advisor, client }) => {
	const [searchParams] = useSearchParams()
	const advisorId = advisor.idToken.payload.sub
	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')

	const [billingPlan, setBillingPlan] = useState({})
	const [isLoading, setIsLoading] = useState(true)

	useEffect(async () => {
		if (client.billingId) {
			await fetch(
				`https://blockria.com/api/coinbase/clients/client/billing?advisorId=${advisorId}&billingId=${client.billingId}`
			)
				.then(response => response.json())
				.then(setBillingPlan)
				.catch(alert)
		}

		setIsLoading(false)
	}, [client])

	function renderBillingAmount({ billingAmount, billingType }) {
		let renderBillingAmount = `${billingAmount} bps / yr`
		if (billingType === 'Fixed') renderBillingAmount = `${formatUSD(billingAmount)} / mo`

		return (
			<td className='AlignRight' style={{ textTransform: 'none' }}>
				{renderBillingAmount}
			</td>
		)
	}

	return (
		<table style={{ marginBottom: 0 }}>
			<caption>
				<div className='Flex'>
					<div className='Title'>Billing Plan</div>
					<Link
						className='Button'
						to={`/advisor/clients/client/setbilling?clientName=${clientName}&clientId=${clientId}`}
					>
						Change Billing Plan
					</Link>
				</div>
			</caption>
			<thead>
				<tr style={{ whiteSpace: 'nowrap' }}>
					<th>NAME</th>
					<th>TYPE</th>
					<th className='AlignRight'>FIRM FEE</th>
					{/* <th className='AlignRight'>PLATFORM FEE</th> */}
					<th className='Break' />
				</tr>
			</thead>
			<tbody>
				{isLoading && (
					<tr>
						<td className='Loading' style={{ borderBottom: 'none' }}>
							Loading...
						</td>
					</tr>
				)}
				{!isLoading && billingPlan.billingId ? (
					<tr>
						<td className='Bold'>{billingPlan.billingName}</td>
						<td>{billingPlan.billingType}</td>
						{renderBillingAmount(billingPlan)}
						{/* <td className='AlignRight' style={{ textTransform: 'none' }}>
							{billingPlan.billingPlatformFee} bps / mo
						</td> */}
						<td />
					</tr>
				) : (
					<tr style={{ background: 'none' }}>
						<td className='Bold Red' style={{ borderBottom: 'none' }}>
							<Link
								className='Red'
								to={`/advisor/clients/client/setbilling?clientName=${clientName}&clientId=${clientId}`}
								style={{ textTransform: 'none' }}
							>
								Assign a Billing Plan
							</Link>
						</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}

export default ClientBilling
