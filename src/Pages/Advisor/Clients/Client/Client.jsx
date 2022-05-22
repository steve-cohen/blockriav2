import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ClientBilling from './ClientBilling'
import ClientDepositsWithdrawals from './ClientDepositsWithdrawals'
import ClientHoldings from './ClientHoldings'
import ClientPerformance from './ClientPerformance'
import ClientPortfolio from './ClientPortfolio'
import ClientTransactions from './ClientTransactions'

import './Client.css'

const Client = ({ advisor }) => {
	const [searchParams] = useSearchParams()
	const advisorId = advisor.idToken.payload.sub
	const clientId = searchParams.get('clientId')

	const [client, setClient] = useState({})
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceNonTradeable, setTotalBalanceNonTradeable] = useState(0)
	const [transactions, setTransactions] = useState([])

	useEffect(() => {
		console.log(advisorId, clientId)
		if (clientId.includes('-')) {
			// Coinbase Client
			fetch(`https://blockria.com/api/coinbase/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
				.then(response => response.json())
				.then(setClient)
				.catch(alert)

			fetch(`https://blockria.com/api/coinbase/clients/client/transactions?clientId=${clientId}`)
				.then(response => response.json())
				.then(newTransactions =>
					setTransactions(newTransactions.sort((a, b) => b.updated_at.localeCompare(a.updated_at)))
				)
				.catch(alert)
		} else {
			// Coinbase Pro Client
			fetch(`https://blockria.com/api/coinbasepro/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
				.then(response => response.json())
				.then(setClient)
				.catch(alert)
		}
	}, [])

	return (
		<div className='Client'>
			<ClientPerformance
				totalBalance={totalBalance}
				totalBalanceNonTradeable={totalBalanceNonTradeable}
				transactions={transactions}
			/>
			<ClientHoldings
				client={client}
				totalBalance={totalBalance}
				totalBalanceNonTradeable={totalBalanceNonTradeable}
				setTotalBalance={setTotalBalance}
				setTotalBalanceNonTradeable={setTotalBalanceNonTradeable}
			/>
			<ClientPortfolio advisor={advisor} client={client} />
			<ClientDepositsWithdrawals advisor={advisor} />
			<ClientTransactions transactions={transactions} />
			<ClientBilling advisor={advisor} client={client} />
		</div>
	)
}

export default Client
