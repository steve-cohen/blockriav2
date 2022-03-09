import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './Deposit.css'

const Deposit = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [accountId, setAccountId] = useState(-1)
	const [amount, setAmount] = useState('')
	const [confirmDeposit, setConfirmDeposit] = useState(false)
	const [depositMethod, setDepositMethod] = useState({
		id: -1,
		limits: { deposit: [{ description: '' }] },
		name: 'Loading...'
	})
	const [depositMethods, setDepositMethods] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [showDepositMethods, setShowDepositMethods] = useState(false)

	useEffect(() => {
		getDepositMethods()
	}, [])

	async function getDepositMethods() {
		const advisorId = advisor.idToken.payload.sub
		const clientId = searchParams.get('clientId')
		console.log({ advisorId, clientId })

		return await fetch(`https://blockria.com/coinbase/paymentmethods?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(newPaymentMethods => {
				console.log(newPaymentMethods)

				if (newPaymentMethods && newPaymentMethods.data && newPaymentMethods.data.length) {
					// Deposit Methods
					const newDepositMethods = newPaymentMethods.data.filter(({ allow_deposit }) => allow_deposit)
					console.log(newDepositMethods)
					setDepositMethods(newDepositMethods)
					setDepositMethod(newDepositMethods[0])

					// AccountId
					const newAccountId = newPaymentMethods.data.filter(({ fiat_account }) => fiat_account !== undefined)
					console.log({ newAccountId })
					if (newAccountId && newAccountId.length) setAccountId(newAccountId[0].fiat_account.id)
				} else {
					setDepositMethod({
						id: -1,
						limits: { deposit: [{ description: '' }] },
						name: 'No Deposit Methods Found'
					})
				}
			})
			.catch(error => alert(JSON.stringify(error)))
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
		url += `&currency=USD`
		url += `&paymentMethod=${depositMethod.id}`

		await fetch(url)
			.then(response => response.json())
			.then(data => {
				console.log(data)
				if (data.errors) {
					alert(data.errors)
				} else {
					navigate(`/advisor/clients/client?clientId=${searchParams.get('clientId')}`)
				}
			})
			.catch(error => alert(error))

		setIsLoading(false)
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
						<div className='Cancel' onClick={() => setConfirmDeposit(false)}>
							Cancel
						</div>
					</form>
				</>
			)}
		</div>
	)
}

export default Deposit
