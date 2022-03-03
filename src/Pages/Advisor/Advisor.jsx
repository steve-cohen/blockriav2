import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import Clients from './Clients/Clients'
import Edit from './Portfolios/Edit/Edit'
import Navigation from './Navigation/Navigation'
import Portfolios from './Portfolios/Portfolios'

import './Advisor.css'

const Advisor = ({ clients, email, portfolios, setPortfolios }) => {
	const [client, setClient] = useState({})
	const [proposedPortfolio, setProposedPortfolio] = useState({
		allocation: { S: '{}' },
		portfolioId: { S: '' },
		portfolioName: { S: 'Select Portfolio' }
	})

	return (
		<div className='Advisor'>
			<Navigation />
			<div className='Body'>
				<Routes>
					<Route path='clients' element={<Clients clients={clients} portfolios={portfolios} />} />
					<Route path='portfolios' element={<Portfolios portfolios={portfolios} />} />
					<Route path='portfolios/edit' element={<Edit portfolios={portfolios} />} />
				</Routes>
			</div>
		</div>
	)
}

export default Advisor
