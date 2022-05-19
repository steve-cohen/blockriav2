import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const noPaymentMethod = {
	id: 0,
	limits: { deposit: [{ description: '' }] },
	name: 'No Withdrawal Methods Found'
}

function formatUSD(number) {
	return Number(number).toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

const Withdrawal = ({ advisor }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const advisorId = advisor.idToken.payload.sub
	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')

	const [amount, setAmount] = useState('')
	const [fiatAccount, setFiatAccount] = useState('')
	const [withdrawalMethod, setWithdrawalMethod] = useState('')
	const [withdrawalMethods, setWithdrawalMethods] = useState([])

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

	function formatPaymentMethods(paymentMethods) {
		console.log(paymentMethods)
		if (paymentMethods.data && paymentMethods.data.length >= 2) {
			// FROM Coinbase Fiat Account
			const newWithdrawalMethods = paymentMethods.data.filter(({ allow_withdraw }) => allow_withdraw)
			setWithdrawalMethods(newWithdrawalMethods)

			// TO Payment Method
			const newFiatAccount = paymentMethods.data.filter(({ fiat_account }) => fiat_account && fiat_account.id)
			console.log(newFiatAccount)
			if (newFiatAccount && newFiatAccount.length) setFiatAccount(newFiatAccount[0])
		} else {
			setWithdrawalMethod(noPaymentMethod)
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

		let newWithdrawalMethod = JSON.parse(withdrawalMethod)
		let url = 'https://blockria.com/coinbase/withdrawal?'
		url += `accountId=${fiatAccount.fiat_account.id}`
		url += `&advisorId=${advisorId}`
		url += `&amount=${amount}`
		url += `&clientId=${clientId}`
		url += `&currency=${newWithdrawalMethod.limits.deposit[0].remaining.currency}`
		url += `&paymentMethod=${newWithdrawalMethod.id}`

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

	function renderWithdrawalMethod(withdrawalMethod) {
		return (
			<option value={JSON.stringify(withdrawalMethod)} key={`Deposit Method ${withdrawalMethod.id}`}>
				{withdrawalMethod.name}
			</option>
		)
	}

	function renderWithdrawalMethodLimit() {
		if (
			fiatAccount &&
			fiatAccount.fiat_account &&
			fiatAccount.fiat_account.balance &&
			fiatAccount.fiat_account.balance.amount
		) {
			return (
				<>
					<div>Withdrawal Limit</div>
					<input disabled={true} value={formatUSD(fiatAccount.fiat_account.balance.amount)} />
				</>
			)
		}
	}

	return isLoading ? (
		<div className='Withdrawal NewForm NewFormWrapper'>
			<div className='Loading'>Loading...</div>
		</div>
	) : (
		<div className={`Withdrawal NewForm ${isConfirming && 'NewFormConfirm'} NewFormWrapper`}>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Withdraw from {clientName}'s Coinbase Account</div>
				<div>Withdrawal Method</div>
				<select
					disabled={isConfirming && true}
					onChange={e => setWithdrawalMethod(e.target.value)}
					required
					value={withdrawalMethod}
				>
					<option disabled value=''>
						Select a Withdrawal Method
					</option>
					{withdrawalMethods.map(renderWithdrawalMethod)}
				</select>
				{renderWithdrawalMethodLimit()}
				<div>Withdrawal Amount</div>
				<input
					disabled={isConfirming && true}
					min={1}
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
						<input disabled={true} value={`Transfer funds out of ${clientName}'s Coinbase account`} />
					</>
				)}
				<input
					className='Continue'
					type='submit'
					value={isConfirming ? 'Confirm Initiate Withdrawal' : 'Initiate Withdrawal'}
				/>
				<div className='Cancel' onClick={() => (isConfirming ? setIsConfirming(false) : navigate(-1))}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default Withdrawal
