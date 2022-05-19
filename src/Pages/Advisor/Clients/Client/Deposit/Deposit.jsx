import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const noPaymentMethod = {
	id: 0,
	limits: { deposit: [{ description: '' }] },
	name: 'No Deposit Methods Found'
}

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Deposit = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const advisorId = advisor.idToken.payload.sub
	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')

	const [accountId, setAccountId] = useState(0)
	const [amount, setAmount] = useState('')
	const [depositMethod, setDepositMethod] = useState('')
	const [depositMethods, setDepositMethods] = useState([])

	const [isConfirming, setIsConfirming] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(async () => {
		setIsLoading(true)

		await fetch(`https://blockria.com/coinbase/paymentmethods?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(formatPaymentMethods)
			.catch(alert)

		setIsLoading(false)
	}, [])

	function formatPaymentMethods(depositMethods) {
		if (depositMethods.data && depositMethods.data.length >= 2) {
			// FROM Payment Method
			let newPaymentMethods = depositMethods.data.filter(({ allow_deposit }) => allow_deposit)
			setDepositMethods(newPaymentMethods)

			// TO Coinbase Fiat Account
			const newAccountId = depositMethods.data.filter(({ fiat_account }) => fiat_account && fiat_account.id)
			if (newAccountId && newAccountId.length) setAccountId(newAccountId[0].fiat_account.id)
		} else {
			setDepositMethod(noPaymentMethod)
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

		let newDepositMethod = JSON.parse(depositMethod)
		let url = 'https://blockria.com/coinbase/deposit?'
		url += `accountId=${accountId}`
		url += `&advisorId=${advisorId}`
		url += `&amount=${amount}`
		url += `&clientId=${clientId}`
		url += `&currency=${newDepositMethod.limits.deposit[0].remaining.currency}`
		url += `&paymentMethod=${newDepositMethod.id}`

		await fetch(url)
			.then(response => response.json())
			.then(data => {
				console.log(data)
				if (data.errors) {
					setIsLoading(false)
					alert(data.errors[0].message)
				} else {
					navigate(`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`)
				}
			})
			.catch(error => {
				setIsLoading(false)
				alert(JSON.stringify(error))
			})
	}

	function renderDepositMethod(depositMethod) {
		return (
			<option value={JSON.stringify(depositMethod)} key={`Deposit Method ${depositMethod.id}`}>
				{depositMethod.name}
			</option>
		)
	}

	function renderDepositMethodLimit() {
		if (!depositMethod) return

		let newDepositMethod = JSON.parse(depositMethod)
		if (
			newDepositMethod &&
			newDepositMethod.limits &&
			newDepositMethod.limits.deposit &&
			newDepositMethod.limits.deposit.length &&
			newDepositMethod.limits.deposit[0].description
		) {
			return (
				<>
					<div>Deposit Limit</div>
					<input disabled={true} value={newDepositMethod.limits.deposit[0].description.replace('of your', '/')} />
				</>
			)
		}
	}

	return isLoading ? (
		<div className='Deposit NewForm NewFormWrapper'>
			<div className='Loading'>Loading...</div>
		</div>
	) : (
		<div className={`Deposit NewForm ${isConfirming && 'NewFormConfirm'} NewFormWrapper`}>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Deposit into {clientName}'s Coinbase Account</div>
				<div>Deposit Method</div>
				<select
					disabled={isConfirming && true}
					onChange={e => setDepositMethod(e.target.value)}
					required
					value={depositMethod}
				>
					<option disabled value=''>
						Select a Deposit Method
					</option>
					{depositMethods.map(renderDepositMethod)}
				</select>
				{renderDepositMethodLimit()}
				<div>Deposit Amount</div>
				<input
					disabled={isConfirming && true}
					min={10}
					onChange={e => setAmount(e.target.value)}
					placeholder='Ex: $10.00'
					required
					step={0.01}
					type={isConfirming ? 'text' : 'number'}
					value={isConfirming ? formatUSD(amount) : amount}
				/>
				{isConfirming && (
					<>
						<div>Description</div>
						<input disabled={true} value={`Transfer funds into ${clientName}'s Coinbase account`} />
					</>
				)}
				<input
					className='Continue'
					type='submit'
					value={isConfirming ? 'Confirm Initiate Deposit' : 'Initiate Deposit'}
				/>
				<div className='Cancel' onClick={() => (isConfirming ? setIsConfirming(false) : navigate(-1))}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default Deposit
