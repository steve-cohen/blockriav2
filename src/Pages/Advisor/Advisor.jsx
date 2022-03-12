import React, { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'

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

import { demoAdvisor, demoAdvisorEmpty, demoClient, demoClients, demoPortfolio, demoPortfolios } from './demoData'

import './Advisor.css'

const Advisor = () => {
	// Advisor Data
	const [advisor, setAdvisor] = useState(JSON.parse(localStorage.getItem('advisor')) || demoAdvisorEmpty)
	const [client, setClient] = useState(JSON.parse(localStorage.getItem('client')) || demoClient)
	const [portfolio, setPortfolio] = useState(JSON.parse(localStorage.getItem('portfolio')) || demoPortfolio)
	const [portfolios, setPortfolios] = useState(JSON.parse(localStorage.getItem('portfolios')) || [] || demoPortfolios)

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
						{advisor.idToken.payload.sub ? (
							<>
								<Route
									path=''
									element={<Clients advisor={advisor} portfolios={portfolios} setPortfolios={setPortfolios} />}
								/>
								<Route
									path='clients'
									element={<Clients advisor={advisor} portfolios={portfolios} setPortfolios={setPortfolios} />}
								/>
								<Route
									path='clients/client'
									element={<Client advisor={advisor} client={client} setClient={setClient} />}
								/>
								<Route path='clients/client/deposit' element={<Deposit advisor={advisor} client={client} />} />
								<Route path='invites' element={<Invites />} />
								<Route
									path='portfolios'
									element={<Portfolios advisor={advisor} portfolios={portfolios} setPortfolios={setPortfolios} />}
								/>
								<Route
									path='portfolios/assign'
									element={<Assign portfolios={portfolios} setPortfolio={setPortfolio} />}
								/>
								<Route
									path='portfolios/confirm'
									element={<Confirm advisor={advisor} client={client} portfolio={portfolio} />}
								/>
								<Route
									path='portfolios/edit'
									element={<Edit portfolios={portfolios} setPortfolios={setPortfolios} />}
								/>
								<Route path='clients/client/withdrawal' element={<Withdrawal advisor={advisor} client={client} />} />
								<Route path='*' element={<Navigate to='' />} />
							</>
						) : (
							<Route path='*' element={<Navigate to='signin' />} />
						)}
						<Route path='signin' element={<SignIn setAdvisor={setAdvisor} setPortfolios={setPortfolios} />} />
						<Route path='signup' element={<SignUp />} />
					</Routes>
				</div>
			</div>
		</div>
	)
}

export default Advisor
