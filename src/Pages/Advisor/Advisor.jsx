import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import Assign from './Portfolios/Assign/Assign'
import Clients from './Clients/Clients'
import Edit from './Portfolios/Edit/Edit'
import Navigation from './Navigation/Navigation'
import Portfolios from './Portfolios/Portfolios'

import './Advisor.css'

const Advisor = ({ clients, email, portfolios, setPortfolios }) => {
	return (
		<div className='Advisor'>
			<div className='Metadata'>
				<Link className='Logo' to='/advisor'>
					B
				</Link>
				<Link className='Firm' to='/advisor'>
					Hardy Capital
				</Link>
				<Link className='Advisor' to='/advisor'>
					Arynton Hardy
				</Link>
			</div>
			<div className='Content'>
				<Navigation />
				<div className='Body'>
					<Routes>
						<Route path='clients' element={<Clients clients={clients} portfolios={portfolios} />} />
						<Route path='portfolios' element={<Portfolios portfolios={portfolios} />} />
						<Route path='portfolios/assign' element={<Assign portfolios={portfolios} />} />
						<Route path='portfolios/edit' element={<Edit portfolios={portfolios} setPortfolios={setPortfolios} />} />
					</Routes>
				</div>
			</div>
		</div>
	)
}

export default Advisor
