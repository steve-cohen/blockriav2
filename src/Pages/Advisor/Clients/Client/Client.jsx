import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ClientAbout from './ClientAbout'
import ClientBilling from './ClientBilling'
import ClientDepositsWithdrawals from './ClientDepositsWithdrawals'
import ClientHoldings from './ClientHoldings'
import ClientPerformance from './ClientPerformance'
import ClientPortfolio from './ClientPortfolio'
import ClientTaxes from './ClientTaxes'
import ClientTransactions from './ClientTransactions'

import formatCoinbaseProTransactions from './formatCoinbaseProTransactions'
import './Client.css'

const Client = ({ advisor }) => {
	const [searchParams] = useSearchParams()
	const advisorId = advisor.idToken.payload.sub
	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')

	const [client, setClient] = useState({})
	const [totalBalance, setTotalBalance] = useState(0)
	const [totalBalanceNonTradeable, setTotalBalanceNonTradeable] = useState(0)
	const [transactions, setTransactions] = useState([])

	useEffect(() => {
		if (clientId.includes('-')) {
			// Coinbase Client
			fetch(`https://blockria.com/api/coinbase/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
				.then(response => response.json())
				.then(setClient)
				.catch(alert)

			fetch(`https://blockria.com/api/coinbase/clients/client/transactions?clientId=${clientId}`)
				.then(response => response.json())
				.then(newTransactions =>
					setTransactions(newTransactions.sort((a, b) => a.updated_at.localeCompare(b.updated_at)))
				)
				.catch(alert)
		} else {
			// Coinbase Pro Client
			fetch(`https://blockria.com/api/coinbasepro/clients/client?advisorId=${advisorId}&clientId=${clientId}`)
				.then(response => response.json())
				.then(setClient)
				.catch(alert)

			fetch(`https://blockria.com/api/coinbasepro/transactions?clientId=${clientId}`)
				.then(response => response.json())
				.then(newCoinbaseProTransactions => formatCoinbaseProTransactions(newCoinbaseProTransactions, setTransactions))
				.catch(alert)
		}
	}, [])

	return (
		<div className='Client'>
			<div className='ClientNavigation'>
				<div>{clientName}</div>
				<a href='#performance'>Performance</a>
				<a href='#holdings'>Holdings</a>
				<a href='#portfolio'>Portfolio</a>
				<a href='#transfers'>Transfers</a>
				<a href='#transactions'>Transactions</a>
				<a href='#taxes'>Taxes</a>
				<a href='#billing'>Billing</a>
				<a href='#about'>About</a>
			</div>
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
			{/* <ClientDepositsWithdrawals advisor={advisor} /> */}
			<ClientTransactions transactions={transactions} />
			{/* <ClientTaxes client={client} transactions={transactions} /> */}
			<ClientBilling advisor={advisor} client={client} />
			{/* <ClientAbout client={client} /> */}
		</div>
	)
}

export default Client
