import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Deposit.css'

const Deposit = ({ clients }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [amount, setAmount] = useState('')
	const [depositMethod, setDepositMethod] = useState({
		id: -1,
		limits: { deposit: [{ description: '' }] },
		name: 'No Deposit Methods Available'
	})
	const [depositMethods, setDepositMethods] = useState([])
	const [showDepositMethods, setShowDepositMethods] = useState(false)

	useEffect(() => {
		const client = clients.filter(({ clientId }) => clientId.S === searchParams.get('clientId'))

		if (client.length) {
			console.log(client)
			console.log(JSON.parse(client[0].paymentMethods.S))
			let newDepositMethods = []
			JSON.parse(client[0].paymentMethods.S)
				.filter(({ allow_deposit }) => allow_deposit)
				.forEach(method => newDepositMethods.push(method))

			console.log(newDepositMethods)
			setDepositMethods(newDepositMethods)

			newDepositMethods.forEach(newDepositMethod => {
				if (newDepositMethod.primary_buy) {
					console.log(newDepositMethod)
					setDepositMethod(newDepositMethod)
				}
			})
		}
	}, [])

	function handleSubmit() {
		let url = 'depositconfirm?'
		url += `clientName=${searchParams.get('clientName')}&clientId=${searchParams.get('clientId')}`
		url += `&depositId=${depositMethod.id}&amount=${amount}`
		navigate(url)
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
		</div>
	)
}

export default Deposit
