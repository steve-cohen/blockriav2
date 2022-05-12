import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './BillingEdit.css'

const billingUnits = {
	'Assets Under Management': '(Basis Points / Month)',
	Fixed: '($ / Month)'
	// Tiered: ''
}

const billingPlaceHolders = {
	'Assets Under Management': 'Ex: 100 bps / mo',
	Fixed: 'Ex: $1,000.00 / mo'
	// Tiered: ''
}

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const BillingEdit = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [billingAmount, setBillingAmount] = useState('')
	const [billingName, setBillingName] = useState('')
	const [billingPlatformFee, setBillingPlatformFee] = useState(20)
	const [billingType, setBillingType] = useState('')
	const [clientsAffected, setClientsAffected] = useState(0)

	const [isConfirming, setIsConfirming] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isFirstLoad, setIsFirstLoad] = useState(true)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(async () => {
		const advisorId = advisor.idToken.payload.sub
		const billingId = searchParams.get('billingId')

		if (billingId) {
			await fetch(`https://blockria.com/api/billing/edit?advisorId=${advisorId}&billingId=${billingId}`)
				.then(response => response.json())
				.then(({ billingAmount, billingName, billingPlatformFee, billingType }) => {
					setBillingAmount(billingAmount)
					setBillingName(billingName)
					setBillingPlatformFee(billingPlatformFee)
					setBillingType(billingType)
				})
				.catch(alert)
		}

		setIsFirstLoad(false)
		setIsLoading(false)

		if (billingId) {
			fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisor.idToken.payload.sub}`)
				.then(response => response.json())
				.then(clients => {
					let newClientsAffected = 0
					clients.forEach(({ billingId }) => {
						if (billingId === searchParams.get('billingId')) ++newClientsAffected
					})
					setClientsAffected(newClientsAffected)
				})
				.catch(alert)
		}
	}, [])

	useEffect(() => {
		if (isFirstLoad) return
		setBillingAmount('')
	}, [billingType])

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
			const deleteOptions = {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ advisorId: advisor.idToken.payload.sub, billingId: searchParams.get('billingId') })
			}

			await fetch('https://blockria.com/api/billing/edit', deleteOptions)
				.then(() => navigate('/advisor/billing'))
				.catch(alert)
		} else {
			const billingOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					advisorId: advisor.idToken.payload.sub,
					billingAmount,
					billingId: searchParams.get('billingId') || Date.now(),
					billingName,
					billingPlatformFee,
					billingType,
					billingUpdatedAt: Date.now()
				})
			}

			await fetch('https://blockria.com/api/billing/edit', billingOptions)
				.then(() => navigate('/advisor/billing'))
				.catch(alert)
		}
	}

	function renderBillingAmount() {
		if (isConfirming) {
			if (billingType === 'Assets Under Management') return `${billingAmount} bps / mo`
			if (billingType === 'Fixed') return `${formatUSD(billingAmount)} / mo`
		}

		return billingAmount
	}

	return (
		<div className={`NewForm ${isConfirming ? 'NewFormConfirm' : ''}`}>
			<div style={{ float: 'left', marginBottom: '48px' }}>
				<form onSubmit={handleSubmit}>
					<div className='Title'>{searchParams.get('billingId') ? 'Edit' : 'New'} Billing Plan</div>
					<div>Billing Plan Name</div>
					<input
						autoComplete='No'
						autoFocus
						disabled={isConfirming ? true : false}
						onChange={e => setBillingName(e.target.value)}
						required
						type='text'
						value={billingName}
					/>
					<div>Billing Plan Type</div>
					<select
						disabled={isConfirming ? true : false}
						onChange={e => setBillingType(e.target.value)}
						required
						value={billingType}
					>
						<option disabled value=''>
							Select a Billing Plan Type
						</option>
						<option value='Assets Under Management'>Assets Under Management</option>
						<option value='Fixed'>Fixed Amount</option>
						{/* <option value='Tiered'>Tiered</option> */}
					</select>
					<div>Billing Plan Amount {billingUnits[billingType]}</div>
					<input
						autoComplete='No'
						disabled={isConfirming ? true : false}
						max={billingType === 'Assets Under Management' ? 10000 : Infinity}
						min={0}
						onChange={e => setBillingAmount(e.target.value)}
						placeholder={billingPlaceHolders[billingType]}
						required
						step={0.01}
						type={isConfirming ? 'text' : 'number'}
						value={renderBillingAmount()}
					/>
					{isConfirming ? (
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
					)}
				</form>
			</div>
		</div>
	)
}

export default BillingEdit
