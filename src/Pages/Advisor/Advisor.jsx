import React, { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import Assign from './Portfolios/Assign/Assign'
import Client from './Clients/Client/Client'
import Clients from './Clients/Clients'
import Confirm from './Portfolios/Confirm/Confirm'
import Deposit from './Clients/Client/Deposit/Deposit'
import Edit from './Portfolios/Edit/Edit'
import Invites from './Invites/Invites'
import Navigation from './Navigation/Navigation'
import Portfolios from './Portfolios/Portfolios'
import SignIn from './SignIn/SignIn'
import SignUp from './SignUp/SignUp'
import Withdrawal from './Clients/Client/Withdrawal/Withdrawal'
import WithdrawalConfirm from './Clients/Client/Withdrawal/WithdrawalConfirm/WithdrawalConfirm'

import { demoAdvisor, demoClient, demoClients, demoPortfolios } from './demoData'

import './Advisor.css'

const Advisor = () => {
	// Advisor Data
	const [advisor, setAdvisor] = useState(demoAdvisor)
	const [client, setClient] = useState(demoClient)
	const [clients, setClients] = useState(demoClients)
	const [portfolios, setPortfolios] = useState(demoPortfolios)

	return (
		<div className='Advisor'>
			<div className='Metadata'>
				<Link className='Logo' to='/'>
					B
				</Link>
				<Link className='Firm' to='/advisor'>
					{advisor.idToken.payload['custom:firm_name']}
				</Link>
				<Link className='Advisor' to='/advisor'>
					{advisor.idToken.payload.given_name} {advisor.idToken.payload.family_name}
				</Link>
			</div>
			<div className='Content'>
				<Navigation />
				<div className='Body'>
					<Routes>
						<Route path='' element={<Clients clients={clients} portfolios={portfolios} />} />
						<Route path='clients' element={<Clients clients={clients} portfolios={portfolios} />} />
						<Route path='clients/client' element={<Client advisor={advisor} client={client} setClient={setClient} />} />
						<Route path='clients/client/deposit' element={<Deposit advisor={advisor} client={client} />} />
						<Route path='invites' element={<Invites />} />
						<Route path='portfolios' element={<Portfolios portfolios={portfolios} />} />
						<Route path='portfolios/assign' element={<Assign portfolios={portfolios} />} />
						<Route path='portfolios/confirm' element={<Confirm portfolios={portfolios} />} />
						<Route path='portfolios/edit' element={<Edit portfolios={portfolios} setPortfolios={setPortfolios} />} />
						<Route path='clients/client/withdrawal' element={<Withdrawal advisor={advisor} />} />
						<Route
							path='clients/client/withdrawal/withdrawalconfirm'
							element={<WithdrawalConfirm clients={clients} />}
						/>
						<Route
							path='signin'
							element={<SignIn setAdvisor={setAdvisor} setClients={setClients} setPortfolios={setPortfolios} />}
						/>
						<Route
							path='signup'
							element={<SignUp setAdvisor={setAdvisor} setClients={setClients} setPortfolios={setPortfolios} />}
						/>
					</Routes>
				</div>
			</div>
		</div>
	)
}

export default Advisor
