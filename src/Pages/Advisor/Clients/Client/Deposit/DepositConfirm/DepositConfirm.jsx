import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './DepositConfirm.css'

const DepositConfirm = ({ clients }) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [depositMethod, setDepositMethod] = useState({
		id: -1,
		limits: { deposit: [{ description: '' }] },
		name: 'No Deposit Method Selected'
	})

	useEffect(() => {
		const client = clients.filter(({ clientId }) => clientId.S === searchParams.get('clientId'))

		if (client.length) {
			let newDepositMethod = {}
			JSON.parse(client[0].paymentMethods.S)
				.filter(({ id }) => id === searchParams.get('depositId'))
				.forEach(method => (newDepositMethod = method))
			console.log(newDepositMethod)

			setDepositMethod(newDepositMethod)
		}
	}, [])

	function handleSubmit(e) {
		e.preventDefault()
		e.stopPropagation()
		console.log('Submit')
	}

	return (
		<div className='DepositConfirm'>
			<div className='Description'>
				<div className='Title'>Confirm a Deposit into {searchParams.get('clientName')}'s Coinbase Account.</div>
			</div>
			<form onSubmit={handleSubmit}>
				<div>{`${depositMethod.name}\n${depositMethod.limits.deposit[0].description.replace('of your', '/')}`}</div>
				<input
					readOnly
					required
					value={Number(searchParams.get('amount')).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
				/>
				<button>Confirm Deposit</button>
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default DepositConfirm
