import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Withdrawal.css'

const Withdrawal = ({ advisor, client }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [accountId, setAccountId] = useState(0)
	const [amount, setAmount] = useState('')
	const [withdrawalMethod, setWithdrawalMethod] = useState({
		id: 0,
		limits: { deposit: [{ description: '' }] },
		name: 'Loading...'
	})

	const [confirmWithdrawal, setConfirmWithdrawal] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [showWithdrawalMethods, setShowWithdrawalMethods] = useState(false)
	const [withdrawalMethods, setWithdrawalMethods] = useState([])

	useEffect(async () => {
		let url = `https://blockria.com/coinbase/paymentmethods`
		await fetch(`${url}?advisorId=${advisor.idToken.payload.sub}&clientId=${searchParams.get('clientId')}`)
			.then(response => response.json())
			.then(formatPaymentMethods)
			.catch(alert)
	}, [])

	function formatPaymentMethods(paymentMethods) {
		if (paymentMethods.data && paymentMethods.data.length >= 2) {
			// FROM Coinbase Fiat Account
			const newWithdrawalMethods = paymentMethods.data.filter(({ allow_withdraw }) => allow_withdraw)
			setWithdrawalMethod(newWithdrawalMethods[0])
			setWithdrawalMethods(newWithdrawalMethods)

			// TO Payment Method
			const newAccountId = paymentMethods.data.filter(({ fiat_account }) => fiat_account && fiat_account.id)
			if (newAccountId && newAccountId.length) setAccountId(newAccountId[0].fiat_account.id)
		} else {
			setWithdrawalMethod({ id: 0, limits: { deposit: [{ description: '' }] }, name: 'No Withdrawal Methods Found' })
		}
	}

	function handleSubmit(e) {
		e.preventDefault()
		e.stopPropagation()
		setConfirmWithdrawal(true)
	}

	async function handleSubmitConfirm(e) {
		e.preventDefault()
		e.stopPropagation()
		setIsLoading(true)

		let url = 'https://blockria.com/coinbase/withdrawal?'
		url += `accountId=${accountId}`
		url += `&advisorId=${advisor.idToken.payload.sub}`
		url += `&amount=${amount}`
		url += `&clientId=${searchParams.get('clientId')}`
		url += `&currency=${withdrawalMethod.limits.deposit[0].remaining.currency}`
		url += `&paymentMethod=${withdrawalMethod.id}`

		await fetch(url)
			.then(response => response.json())
			.then(data => {
				console.log(data)
				if (data.errors) {
					setIsLoading(false)
					alert(data.errors[0].message)
				} else {
					navigate(
						`/advisor/clients/client?clientName=${searchParams.get('clientName')}&clientId=${searchParams.get(
							'clientId'
						)}`
					)
				}
			})
			.catch(error => {
				setIsLoading(false)
				alert(JSON.stringify(error))
			})
	}

	function renderWithdrawalMethod(newWithdrawalMethod) {
		return (
			<div
				className='Method'
				key={`WithdrawalMethod ${newWithdrawalMethod.id}`}
				onClick={() => {
					setWithdrawalMethod(newWithdrawalMethod)
					setShowWithdrawalMethods(false)
				}}
			>
				{newWithdrawalMethod.name}
			</div>
		)
	}

	return (
		<div className='Withdrawal'>
			{!confirmWithdrawal ? (
				<>
					<div className='Description'>
						<div className='Title'>Initiate a Withdrawal from {searchParams.get('clientName')}'s Coinbase Account.</div>
						<p>
							<b>New and exisiting bank accounts </b>
							<span>
								may take up to 24 hours to appear while the client undergoes Coinbase verification and Know Your
								Customer (KYC) procedures.
							</span>
						</p>
					</div>
					<form className='Options' onSubmit={handleSubmit}>
						<div className='SelectedMethod' onClick={() => setShowWithdrawalMethods(!showWithdrawalMethods)}>
							{withdrawalMethod.name}
							<div className='Icon' style={showWithdrawalMethods ? { transform: 'scaleY(-1)' } : {}}>
								<svg viewBox='0 0 24 24'>
									<path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z' />
								</svg>
							</div>
						</div>
						{showWithdrawalMethods ? (
							<div className='Methods'>{withdrawalMethods.map(renderWithdrawalMethod)}</div>
						) : null}
						<input
							className='Amount'
							onChange={e => setAmount(e.target.value)}
							placeholder='AMOUNT'
							min={1}
							required
							step={0.01}
							type='number'
							value={amount}
						/>
						<button className='InitiateWithdrawal'>Initiate Withdrawal</button>
						<div className='Cancel' onClick={() => navigate(-1)}>
							Cancel
						</div>
					</form>
				</>
			) : (
				<>
					<div className='Description'>
						<div className='Title'>Confirm a Withdrawal from {searchParams.get('clientName')}'s Coinbase Account.</div>
					</div>
					<form className='Options' onSubmit={handleSubmitConfirm}>
						<div className='SelectedMethod'>{withdrawalMethod.name}</div>
						<input
							className='Amount'
							readOnly
							required
							value={Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
						/>
						<button className='InitiateWithdrawalConfirm'>{isLoading ? 'Loading...' : 'Confirm Withdrawal'}</button>
						{isLoading ? null : (
							<div className='Cancel' onClick={() => setConfirmWithdrawal(false)}>
								Cancel
							</div>
						)}
					</form>
				</>
			)}
		</div>
	)
}

export default Withdrawal
