import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ClientHoldings from './ClientHoldings'
import ClientDepositsWithdrawals from './ClientDepositsWithdrawals'
import ClientPortfolio from './ClientPortfolio'
import ClientTransactions from './ClientTransactions'
import './Client.css'

const Client = ({ advisor }) => {
	const [searchParams] = useSearchParams()

	const [client, setClient] = useState({})
	const [transactions, setTransactions] = useState([])

	useEffect(() => {
		const advisorId = advisor.idToken.payload.sub
		const clientId = searchParams.get('clientId')

		fetch(`https://blockria.com/api/coinbase/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
			.then(response => response.json())
			.then(setClient)
			.catch(alert)

		fetch(`https://blockria.com/api/coinbase/clients/client/transactions?clientId=${clientId}`)
			.then(response => response.json())
			.then(setTransactions)
			.catch(alert)
	}, [])

	return (
		<div className='Client'>
			<ClientHoldings client={client} />
			<ClientPortfolio advisor={advisor} client={client} />
			<ClientDepositsWithdrawals advisor={advisor} />
			<ClientTransactions transactions={transactions} />
		</div>
	)
}

export default Client
