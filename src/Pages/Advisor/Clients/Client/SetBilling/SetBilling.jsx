import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './SetBilling.css'

const billingUnits = {
	'Assets Under Management': '(Basis Points / Month)',
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
	const [exisitingBillingId, setExisitingBillingId] = useState('')

	const [isConfirming, setIsConfirming] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(async () => {
		await Promise.all([GETBillingPlans(), GETBillingPlan()])
		await console.log(billingPlan, billingPlans)
		await setIsLoading(false)
	}, [])

	async function GETBillingPlan() {
		const exisitingBillingId = await fetch(
			`https://blockria.com/api/coinbase/clients/client?advisorId=${advisorId}&clientId=${clientId}`
		)
			.then(response => response.json())
			.then(newClient => newClient.billingId)
			.catch(alert)
		console.log(exisitingBillingId)
		setExisitingBillingId(exisitingBillingId)

		if (exisitingBillingId) {
			await fetch(`https://blockria.com/api/billing/edit?advisorId=${advisorId}&billingId=${exisitingBillingId}`)
				.then(response => response.json())
				.then(setBillingPlan)
				.catch(alert)
		}
	}

	function GETBillingPlans() {
		return fetch(`https://blockria.com/api/billing?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(setBillingPlans)
			.catch(alert)
	}

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

		if (isDeleting) {
			// const deleteOptions = {
			// 	method: 'DELETE',
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({ advisorId: advisor.idToken.payload.sub, billingId: searchParams.get('billingId') })
			// }
			// await fetch('https://blockria.com/api/billing/edit', deleteOptions)
			// 	.then(() => navigate('/advisor/billing'))
			// 	.catch(alert)
		} else {
			const billingOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					advisorId,
					billingId: billingPlan.billingId,
					clientId
				})
			}
			console.log(billingOptions)

			await fetch('https://blockria.com/api/coinbase/clients/client/billing', billingOptions)
				.then(() => navigate(`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`))
				.catch(alert)
		}
	}
	function renderBillingAmount() {
		if (billingPlan.billingType === 'Assets Under Management') return `${billingPlan.billingAmount} bps / mo`
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

	return (
		<div className={`SetBilling ${isConfirming ? 'SetBillingConfirm' : ''}`}>
			<div style={{ float: 'left', marginBottom: '48px' }}>
				<form onSubmit={handleSubmit}>
					<div className='Title'>Billing Plan for {clientName}</div>
					<div>Billing Plan</div>
					<select
						disabled={isConfirming ? true : false}
						onChange={e => setBillingPlan(JSON.parse(e.target.value))}
						required
						value={JSON.stringify(billingPlan) || ''}
					>
						<option disabled value='{}'>
							Select a Billing Plan
						</option>
						{billingPlans.map(renderBillingPlanOption)}
					</select>
					{billingPlan.billingId && (
						<>
							<div>Billing Plan Type</div>
							<input disabled={true} value={billingPlan.billingType || ''} />
							<div>Billing Plan Amount {billingUnits[billingPlan.billingType]}</div>
							<input disabled={true} value={renderBillingAmount()} />
							{isConfirming ? (
								<>
									<div>Block RIA Platform Fee (Basis Points / Month)</div>
									<input disabled={true} value={`${billingPlan.billingPlatformFee} bps / mo`} />
									<input
										className='Continue'
										disabled={isLoading ? true : false}
										style={isLoading ? { cursor: 'default', textDecoration: 'none' } : {}}
										type='submit'
										value={isLoading ? 'Loading...' : 'Confirm Billing Plan'}
									/>
									{!isLoading && (
										<div
											className='Cancel'
											onClick={() => {
												setIsDeleting(false)
												setIsConfirming(false)
											}}
										>
											Cancel
										</div>
									)}
								</>
							) : (
								<>
									<input className='Continue' type='submit' value='Set Billing Plan' />
									{exisitingBillingId && (
										<div
											className='Delete'
											onClick={() => {
												setIsDeleting(true)
												setIsConfirming(true)
											}}
											style={{ marginLeft: '12px' }}
										>
											{isLoading ? 'Loading...' : 'Delete Billing Plan'}
										</div>
									)}
									<div className='Cancel' onClick={() => navigate(-1)}>
										Cancel
									</div>
								</>
							)}
						</>
					)}
					{/* {isConfirming ? (
						<>
							<div>Block RIA Platform Fee (Basis Points / Month)</div>
							<input disabled={true} type='text' value={`${billingPlatformFee} bps / mo`} />
							<div>Number of Clients Affected</div>
							<input disabled={true} value={`${clientsAffected} Clients Affected`} />
							<input
								className={isDeleting ? 'Delete' : 'Continue'}
								disabled={isLoading ? true : false}
								style={isLoading ? { cursor: 'default', textDecoration: 'none' } : {}}
								type='submit'
								value={isLoading ? 'Loading...' : isDeleting ? 'Confirm Delete Billing Plan' : 'Confirm Billing Plan'}
							/>
							{!isLoading ? (
								<div
									className='Cancel'
									onClick={() => {
										setIsDeleting(false)
										setIsConfirming(false)
									}}
								>
									Cancel
								</div>
							) : null}
						</>
					) : (
						<>
							<input
								className='Continue'
								disabled={isLoading ? true : false}
								style={isLoading ? { cursor: 'default', textDecoration: 'none' } : {}}
								type='submit'
								value={
									isLoading ? 'Loading...' : searchParams.get('billingId') ? 'Edit Billing Plan' : 'Create Billing Plan'
								}
							/>
							{searchParams.get('billingId') ? (
								<div
									className='Delete'
									onClick={() => {
										setIsDeleting(true)
										setIsConfirming(true)
									}}
									style={{ marginLeft: '12px' }}
								>
									{isLoading ? 'Loading...' : 'Delete Billing Plan'}
								</div>
							) : null}
							<div className='Cancel' onClick={() => navigate(-1)}>
								Cancel
							</div>
						</>
					)} */}
				</form>
			</div>
		</div>
	)
}

export default SetBilling
