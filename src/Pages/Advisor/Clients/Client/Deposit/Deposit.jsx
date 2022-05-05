import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Deposit.css'

const Deposit = ({ advisor, client }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [accountId, setAccountId] = useState(0)
	const [amount, setAmount] = useState('')
	const [depositMethod, setDepositMethod] = useState({
		id: 0,
		limits: { deposit: [{ description: '' }] },
		name: 'Loading...'
	})

	const [confirmDeposit, setConfirmDeposit] = useState(false)
	const [depositMethods, setDepositMethods] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [showDepositMethods, setShowDepositMethods] = useState(false)

	useEffect(async () => {
		let url = `https://blockria.com/coinbase/paymentmethods`
		await fetch(`${url}?advisorId=${advisor.idToken.payload.sub}&clientId=${searchParams.get('clientId')}`)
			.then(response => response.json())
			.then(formatPaymentMethods)
			.catch(alert)
	}, [])

	function formatPaymentMethods(paymentMethods) {
		if (paymentMethods.data && paymentMethods.data.length >= 2) {
			// FROM Payment Method
			let newDepositMethods = paymentMethods.data.filter(({ allow_deposit }) => allow_deposit)
			setDepositMethod(newDepositMethods[0])
			setDepositMethods(newDepositMethods)

			// TO Coinbase Fiat Account
			const newAccountId = paymentMethods.data.filter(({ fiat_account }) => fiat_account && fiat_account.id)
			if (newAccountId && newAccountId.length) setAccountId(newAccountId[0].fiat_account.id)
		} else {
			setDepositMethod({
				id: 0,
				limits: { deposit: [{ description: '' }] },
				name: 'No Deposit Methods Found'
			})
		}
	}

	function handleSubmit(e) {
		e.preventDefault()
		e.stopPropagation()
		setConfirmDeposit(true)
	}

	async function handleSubmitConfirm(e) {
		e.preventDefault()
		e.stopPropagation()
		setIsLoading(true)

		let url = 'https://blockria.com/coinbase/deposit?'
		url += `accountId=${accountId}`
		url += `&advisorId=${advisor.idToken.payload.sub}`
		url += `&amount=${amount}`
		url += `&clientId=${searchParams.get('clientId')}`
		url += `&currency=${depositMethod.limits.deposit[0].remaining.currency}`
		url += `&paymentMethod=${depositMethod.id}`

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

	function renderDepositMethod(newDepositMethod) {
		return (
			<div
				className='Method'
				key={`DepositMethod ${newDepositMethod.id}`}
				onClick={() => {
					setDepositMethod(newDepositMethod)
					setShowDepositMethods(false)
				}}
			>
				{`${newDepositMethod.name}\n${newDepositMethod.limits.deposit[0].description.replace('of your', '/')}`}
			</div>
		)
	}

	return (
		<div className='Deposit'>
			{!confirmDeposit ? (
				<>
					<div className='Description'>
						<div className='Title'>Initiate a Deposit into {searchParams.get('clientName')}'s Coinbase Account.</div>
						<p>
							<b>New and exisiting bank accounts </b>
							<span>
								may take up to 24 hours to appear while the client undergoes Coinbase verification and Know Your
								Customer (KYC) procedures.
							</span>
						</p>
					</div>
					<form className='Options' onSubmit={handleSubmit}>
						<div className='SelectedMethod' onClick={() => setShowDepositMethods(!showDepositMethods)}>
							{`${depositMethod.name}\n${depositMethod.limits.deposit[0].description.replace('of your', '/')}`}
							<div className='Icon' style={showDepositMethods ? { transform: 'scaleY(-1)' } : {}}>
								<svg viewBox='0 0 24 24'>
									<path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z' />
								</svg>
							</div>
						</div>
						{showDepositMethods ? <div className='Methods'>{depositMethods.map(renderDepositMethod)}</div> : null}
						<input
							className='Amount'
							min={10}
							onChange={e => setAmount(e.target.value)}
							placeholder='AMOUNT'
							required
							step={0.01}
							type='number'
							value={amount}
						/>
						<button className='InitiateDeposit'>Initiate Deposit</button>
						<div className='Cancel' onClick={() => navigate(-1)}>
							Cancel
						</div>
					</form>
				</>
			) : (
				<>
					<div className='Description'>
						<div className='Title'>Confirm a Deposit into {searchParams.get('clientName')}'s Coinbase Account.</div>
					</div>
					<form className='Options' onSubmit={handleSubmitConfirm}>
						<div className='SelectedMethod'>
							{`${depositMethod.name}\n${depositMethod.limits.deposit[0].description.replace('of your', '/')}`}
						</div>
						<input
							className='Amount'
							readOnly
							required
							value={Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
						/>
						<button className='InitiateDepositConfirm'>{isLoading ? 'Loading...' : 'Confirm Deposit'}</button>
						{isLoading ? null : (
							<div className='Cancel' onClick={() => setConfirmDeposit(false)}>
								Cancel
							</div>
						)}
					</form>
				</>
			)}
		</div>
	)
}

export default Deposit
