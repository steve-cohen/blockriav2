import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './BillingEdit.css'

const BillingEdit = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [billingAmount, setBillingAmount] = useState('')
	const [billingAmountPlaceHolder, setBillingAmountPlaceHolder] = useState('')
	const [billingName, setBillingName] = useState('')
	const [billingPlatformFee] = useState(20)
	const [billingType, setBillingType] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		setBillingAmount('')

		if (billingType === 'AssetsUnderManagement') setBillingAmountPlaceHolder('Ex: 100 bps')
		else if (billingType === 'Fixed') setBillingAmountPlaceHolder('Ex: $10,000')
		// else if (billingType === 'Tiered') setBillingAmountPlaceHolder('Ex: ')
	}, [billingType])

	async function handleSubmit(e) {
		e.preventDefault()
		setIsLoading(true)

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			setIsLoading(false)
			return
		}

		const billingOptions = {
			advisorId: advisor.idToken.payload.sub,
			billingAmount,
			billingId: searchParams.get('billingId') || Date.now(),
			billingName,
			billingPlatformFee,
			billingType,
			billingUpdatedAt: Date.now()
		}
		console.log(JSON.stringify(billingOptions))

		await fetch('https://blockria.com/api/billing', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(billingOptions)
		})
			.then(() => navigate('/advisor/billing'))
			.catch(alert)
	}

	return (
		<div className='BillingEdit'>
			<div style={{ float: 'left', marginBottom: '48px' }}>
				<form onSubmit={handleSubmit}>
					<div className='Title'>New Billing Plan</div>
					<div>Billing Plan Name</div>
					<input
						autoComplete='No'
						autoFocus
						onChange={e => setBillingName(e.target.value)}
						required
						type='text'
						value={billingName}
					/>
					<div>Billing Plan Type</div>
					<select defaultValue={billingType} onChange={e => setBillingType(e.target.value)} required>
						<option disabled value=''>
							Select a Billing Plan Type
						</option>
						<option value='Assets Under Management'>Assets Under Management</option>
						<option value='Fixed'>Fixed Amount</option>
						{/* <option value='Tiered'>Tiered</option> */}
					</select>
					<div>Billing Plan Amount</div>
					<input
						autoComplete='No'
						min={0}
						onChange={e => setBillingAmount(e.target.value)}
						placeholder={billingAmountPlaceHolder}
						required
						step={0.01}
						type='number'
						value={billingAmount}
					/>
					<div>Block RIA Platform Fee</div>
					<input autoComplete='No' disabled={true} type='text' value={`${billingPlatformFee} bps`} />
					<input
						className='CreatePlan'
						disabled={isLoading ? true : false}
						style={isLoading ? { cursor: 'default', textDecoration: 'none' } : {}}
						type='submit'
						value={isLoading ? 'Loading...' : 'Create Billing Plan'}
					/>
					<div className='Cancel' onClick={() => navigate(-1)}>
						Cancel
					</div>
				</form>
			</div>
		</div>
	)
}

export default BillingEdit
