import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const billingUnits = {
	'Assets Under Management': '(Basis Points / Year)',
	Fixed: '($ / Month)'
	// Tiered: ''
}

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const SetBilling = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const advisorId = advisor.idToken.payload.sub
	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')

	const [billingPlan, setBillingPlan] = useState({})
	const [billingPlans, setBillingPlans] = useState([])
	const [isConfirming, setIsConfirming] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(async () => {
		await fetch(`https://blockria.com/api/billing?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(setBillingPlans)
			.catch(alert)

		setIsLoading(false)
	}, [])
	async function handleSubmit(e) {
		e.preventDefault()

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			return
		}

		if (!isConfirming) {
			setIsConfirming(true)
			return
		}

		setIsLoading(true)

		const billingOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				advisorId,
				billingId: billingPlan.billingId,
				clientId
			})
		}

		await fetch('https://blockria.com/api/coinbase/clients/client/billing', billingOptions)
			.then(() => navigate(`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`))
			.catch(alert)
	}
	function renderBillingAmount() {
		if (billingPlan.billingType === 'Assets Under Management') return `${billingPlan.billingAmount} bps / yr`
		if (billingPlan.billingType === 'Fixed') return `${formatUSD(billingPlan.billingAmount)} / mo`
		return ''
	}

	function renderBillingPlanOption(newBillingPlan) {
		return (
			<option key={`Billing Option ${newBillingPlan.billingId}`} value={JSON.stringify(newBillingPlan)}>
				{newBillingPlan.billingName}
			</option>
		)
	}

	return isLoading ? (
		<div className='SetBilling NewForm NewFormWrapper'>
			<div className='Loading'>Loading...</div>
		</div>
	) : (
		<div className={`SetBilling NewForm ${isConfirming && 'NewFormConfirm'} NewFormWrapper`}>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Billing Plan for {clientName}</div>
				<div>Billing Plan</div>
				<select
					disabled={isConfirming && true}
					onChange={e => setBillingPlan(JSON.parse(e.target.value))}
					required
					value={JSON.stringify(billingPlan) || ''}
				>
					<option disabled value='{}'>
						Select a Billing Plan
					</option>
					{billingPlans.map(renderBillingPlanOption)}
					<option value='{"billingId":""}'>No Billing Plan</option>
				</select>
				{billingPlan.billingId && (
					<>
						<div>Billing Plan Type</div>
						<input disabled={true} value={billingPlan.billingType || ''} />
						<div>Billing Plan Amount {billingUnits[billingPlan.billingType]}</div>
						<input disabled={true} value={renderBillingAmount()} />
					</>
				)}
				{isConfirming && (
					<>
						<div>New Billing Plan Begins</div>
						<input disabled={true} value='12:00:00 AM GMT-0700 (Pacific Daylight Time)' />
					</>
				)}
				<input className='Continue' type='submit' value={isConfirming ? 'Confirm Billing Plan' : 'Set Billing Plan'} />
				<div className='Cancel' onClick={() => (isConfirming ? setIsConfirming(false) : navigate(-1))}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default SetBilling
