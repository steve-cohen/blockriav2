import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Withdrawal.css'

const Withdrawal = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [amount, setAmount] = useState('')
	const [showWithdrawalMethods, setShowWithdrawalMethods] = useState(false)
	const [withdrawalMethod, setWithdrawalMethod] = useState({
		id: -1,
		limits: { deposit: [{ description: '' }] },
		name: 'Loading...'
	})
	const [withdrawalMethods, setWithdrawalMethods] = useState([])

	useEffect(() => {
		getPaymentMethods(advisor.idToken.payload.sub, searchParams.get('clientId'))
	}, [])

	async function getPaymentMethods(advisorId, clientId) {
		console.log({ advisorId, clientId })
		return await fetch(`https://blockria.com/coinbase/paymentmethods?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(newPaymentMethods => {
				console.log(newPaymentMethods)

				if (newPaymentMethods && newPaymentMethods.data && newPaymentMethods.data.length) {
					const newWithdrawalMethods = newPaymentMethods.data.filter(({ allow_withdraw }) => allow_withdraw)

					console.log(newWithdrawalMethods)
					setWithdrawalMethods(newWithdrawalMethods)
					setWithdrawalMethod(newWithdrawalMethods[0])
				} else {
					setWithdrawalMethod({
						id: -1,
						limits: { deposit: [{ description: '' }] },
						name: 'No Withdrawal Method Found'
					})
				}
			})
			.catch(error => alert(error))
	}

	function handleSubmit() {
		let url = 'withdrawalconfirm?'
		url += `clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`
		url += `&withdrawalId=${withdrawalMethod.id}&amount=${amount}`
		navigate(url)
	}

	function renderWithdrawalMethod(newWithdrawalMethod) {
		return (
			<div
				className='Method'
				key={`Withdrawal ${newWithdrawalMethod.id}`}
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
			<div className='Description'>
				<div className='Title'>Initiate a Withdrawal from {searchParams.get('clientName')}'s Coinbase Account.</div>
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
				{showWithdrawalMethods ? <div className='Methods'>{withdrawalMethods.map(renderWithdrawalMethod)}</div> : null}
				<input
					className='Amount'
					onChange={e => setAmount(e.target.value)}
					placeholder='AMOUNT'
					required
					type='number'
					value={amount}
				/>
				<button className='InitiateWithdrawal'>Initiate Withdrawal</button>
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default Withdrawal
