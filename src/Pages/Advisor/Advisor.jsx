import React, { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'

import Client from './Clients/Client/Client'
import Clients from './Clients/Clients'
import Deposit from './Clients/Client/Deposit/Deposit'
import Edit from './Portfolios/Edit/Edit'
import Invites from './Invites/Invites'
import Navigation from './Navigation/Navigation'
import Portfolios from './Portfolios/Portfolios'
import SetPortfolio from './Clients/Client/SetPortfolio/SetPortfolio'
import Settings from './Settings/Settings'
import SignIn from './SignIn/SignIn'
import SignUp from './SignUp/SignUp'
import Withdrawal from './Clients/Client/Withdrawal/Withdrawal'
import VerifyEmail from './VerifyEmail/VerifyEmail'

import { demoAdvisor, demoAdvisorEmpty, demoClientEmpty, demoClients, demoPortfolio, demoPortfolios } from './demoData'

import './Advisor.css'

const Advisor = () => {
	// Advisor Data
	const [advisor, setAdvisor] = useState(JSON.parse(localStorage.getItem('advisor')) || demoAdvisorEmpty)
	const [client, setClient] = useState(JSON.parse(localStorage.getItem('client')) || demoClientEmpty)
	const [portfolio, setPortfolio] = useState(JSON.parse(localStorage.getItem('portfolio')) || demoPortfolio)
	const [portfolios, setPortfolios] = useState([])

	return (
		<div className='Advisor'>
			<div className='Metadata'>
				<Link className='Logo' to='/advisor'>
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
								<Route
									path='clients/client/setportfolio'
									element={<SetPortfolio advisor={advisor} portfolios={portfolios} />}
								/>
								<Route path='clients/client/withdrawal' element={<Withdrawal advisor={advisor} client={client} />} />
								<Route path='invites' element={<Invites />} />
								<Route
									path='portfolios'
									element={<Portfolios advisor={advisor} portfolios={portfolios} setPortfolios={setPortfolios} />}
								/>
								<Route
									path='portfolios/edit'
									element={<Edit portfolios={portfolios} setPortfolios={setPortfolios} />}
								/>
								<Route path='settings' element={<Settings advisor={advisor} />} />
								<Route path='*' element={<Navigate to='' />} />
							</>
						) : (
							<Route path='*' element={<Navigate to='signin' />} />
						)}
						<Route path='signin' element={<SignIn setAdvisor={setAdvisor} setPortfolios={setPortfolios} />} />
						<Route path='signup' element={<SignUp />} />
						<Route path='verifyemail' element={<VerifyEmail />} />
					</Routes>
				</div>
			</div>
		</div>
	)
}

export default Advisor
