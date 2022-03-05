import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Account } from './Account'

import Advisor from './Pages/Advisor/Advisor'
import Home from './Pages/Home/Home'
import SignIn from './Pages/SignIn/SignIn'
import SignUp from './Pages/SignUp/SignUp'

import './App.css'

function App() {
	const [clients, setClients] = useState([
		{
			clientId: { S: 'io8jhwaoidsfd32r' },
			clientName: { S: 'Steve Cohen' },
			nonzeroAccounts: { S: '[]' },
			portfolioId: { S: '' }
		},
		{
			clientId: { S: 'asd83297y4ajksd' },
			clientName: { S: 'Arynton Hardy' },
			nonzeroAccounts: { S: '[{"native_balance":{"amount":27382.17,"currency":"USD"}}]' },
			portfolioId: { S: '1645518066986' }
		},
		{
			clientId: { S: 'asdaswq23wed' },
			clientName: { S: 'Madelaine Diaz' },
			nonzeroAccounts: { S: '[{"native_balance":{"amount":14082.98,"currency":"USD"}}]' },
			portfolioId: { S: '1645518264828' }
		}
	])
	const [email, setEmail] = useState('')
	const [portfolios, setPortfolios] = useState([
		{
			portfolioId: {
				S: '1645518066986'
			},
			portfolioName: {
				S: 'Classic'
			},
			allocations: {
				S: '[{"currency":"BTC","percent":60},{"currency":"ETH","percent":40}]'
			}
		},
		{
			portfolioId: {
				S: '1645518264828'
			},
			portfolioName: {
				S: 'Equal'
			},
			allocations: {
				S: '[{"currency":"BTC","percent":50},{"currency":"ETH","percent":50}]'
			}
		},
		{
			portfolioId: {
				S: '2645518264828'
			},
			portfolioName: {
				S: 'Bitcoin'
			},
			allocations: {
				S: '[{"currency":"BTC","percent":100}]'
			}
		}
	])

	return (
		<Account className='App'>
			<Routes>
				<Route
					path='/advisor/*'
					element={<Advisor clients={clients} email={email} portfolios={portfolios} setPortfolios={setPortfolios} />}
				/>
				<Route
					path='/signin'
					element={<SignIn email={email} setClients={setClients} setEmail={setEmail} setPortfolios={setPortfolios} />}
				/>
				<Route path='/signup' element={<SignUp />} />
				<Route path='/' element={<Home />} />
			</Routes>
		</Account>
	)
}

export default App
