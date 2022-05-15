import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './BillingEdit.css'

const billingUnits = {
	'Assets Under Management': '(Basis Points / Year)',
	Fixed: '($ / Month)'
}

const billingPlaceHolders = {
	'Assets Under Management': 'Ex: 100 bps / yr',
	Fixed: 'Ex: $1,000.00 / mo'
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
	const advisorId = advisor.idToken.payload.sub
	const billingId = searchParams.get('billingId')

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
			fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisorId}`)
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

	async function handleDelete() {
		if (!isConfirming) {
			setIsConfirming(true)
			setIsDeleting(true)
			return
		}

		const deleteOptions = {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ advisorId, billingId })
		}

		await fetch('https://blockria.com/api/billing/edit', deleteOptions)
			.then(() => navigate('/advisor/billing'))
			.catch(alert)
	}

	function handleCancel() {
		if (isConfirming) {
			setIsDeleting(false)
			setIsConfirming(false)
		} else {
			navigate(-1)
		}
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

		const billingOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				advisorId,
				billingAmount,
				billingId: billingId || Date.now(),
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

	function renderBillingAmount() {
		if (isConfirming) {
			if (billingType === 'Assets Under Management') return `${billingAmount} bps / yr`
			if (billingType === 'Fixed') return `${formatUSD(billingAmount)} / mo`
		}

		return billingAmount
	}

	function renderDelete() {
		if (!billingId) return
		if (isConfirming && !isDeleting) return

		return (
			<div className='Delete' onClick={handleDelete} style={isConfirming ? {} : { marginLeft: '12px' }}>
				{isConfirming ? 'Confirm Delete Portfolio' : 'Delete Portfolio'}
			</div>
		)
	}

	return !isLoading ? (
		<div className={`BillingEdit NewForm ${isConfirming && 'NewFormConfirm'}`}>
			<form onSubmit={handleSubmit}>
				<div className='Title'>{billingId ? 'Edit' : 'Create a'} Billing Plan</div>
				<div>Billing Plan Name</div>
				<input
					autoComplete='No'
					autoFocus
					disabled={isConfirming && true}
					onChange={e => setBillingName(e.target.value)}
					required
					value={billingName}
				/>
				<div>Billing Plan Type</div>
				<select
					disabled={isConfirming && true}
					onChange={e => setBillingType(e.target.value)}
					required
					value={billingType}
				>
					<option disabled value=''>
						Select a Billing Plan Type
					</option>
					<option value='Assets Under Management'>Assets Under Management</option>
					<option value='Fixed'>Fixed Amount</option>
				</select>
				<div>Billing Plan Amount {billingUnits[billingType]}</div>
				<input
					autoComplete='No'
					disabled={isConfirming && true}
					max={billingType === 'Assets Under Management' ? 10000 : Infinity}
					min={0}
					onChange={e => setBillingAmount(e.target.value)}
					placeholder={billingPlaceHolders[billingType]}
					required
					step={0.01}
					type={isConfirming ? 'text' : 'number'}
					value={renderBillingAmount()}
				/>
				{isConfirming && (
					<>
						<div>Number of Clients Affected</div>
						<input
							disabled={true}
							value={
								clientsAffected === 1 ? `${clientsAffected} Client Affected` : `${clientsAffected} Clients Affected`
							}
						/>
					</>
				)}
				{!isDeleting && (
					<input className='Continue' type='submit' value={billingId ? 'Edit Billing Plan' : 'Create Billing Plan'} />
				)}
				{renderDelete()}
				<div className='Cancel' onClick={handleCancel}>
					Cancel
				</div>
			</form>
		</div>
	) : (
		<div className='BillingEdit'>
			<div className='Loading'>Loading...</div>
		</div>
	)
}

export default BillingEdit
