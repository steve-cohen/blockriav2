import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Account } from './Account'

import Advisor from './Pages/Advisor/Advisor'
import Home from './Pages/Home/Home'

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
			allocation: {
				S: '{"BTC":60,"ETH":40}'
			}
		},
		{
			portfolioId: {
				S: '1645518264828'
			},
			portfolioName: {
				S: 'Equal'
			},
			allocation: {
				S: '{"BTC":50,"ETH":50}'
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
				{/* <Route path='/signup' element={<SignUp />} /> */}
				{/* <Route
					path='/signin'
					element={<SignIn email={email} setClients={setClients} setEmail={setEmail} setPortfolios={setPortfolios} />}
				/> */}
				<Route path='/' element={<Home />} />
			</Routes>
		</Account>
	)
}

export default App
