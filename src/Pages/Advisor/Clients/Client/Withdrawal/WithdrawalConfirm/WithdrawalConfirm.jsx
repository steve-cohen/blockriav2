import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './WithdrawalConfirm.css'

const WithdrawalConfirm = ({ clients }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [withdrawalMethod, setWithdrawalMethod] = useState({ id: -1, name: 'No Withdrawal Method Selected' })

	useEffect(() => {
		const client = clients.filter(({ clientId }) => clientId.S === searchParams.get('clientId'))

		if (client.length) {
			let newWithdrawalMethod = {}
			JSON.parse(client[0].paymentMethods.S)
				.filter(({ id }) => id === searchParams.get('withdrawalId'))
				.forEach(method => (newWithdrawalMethod = method))
			console.log(newWithdrawalMethod)

			setWithdrawalMethod(newWithdrawalMethod)
		}
	}, [])

	function handleSubmit(e) {
		e.preventDefault()
		e.stopPropagation()
		console.log('Submit')
	}

	return (
		<div className='WithdrawalConfirm'>
			<div className='Description'>
				<div className='Title'>Confirm a Withdrawal from {searchParams.get('clientName')}'s Coinbase Account.</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div>{withdrawalMethod.name}</div>
				<input
					readOnly
					required
					value={Number(searchParams.get('amount')).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
				/>
				<button>Confirm Withdrawal</button>
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default WithdrawalConfirm
