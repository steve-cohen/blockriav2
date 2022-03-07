import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import Assign from './Portfolios/Assign/Assign'
import Client from './Clients/Client/Client'
import Clients from './Clients/Clients'
import Confirm from './Portfolios/Confirm/Confirm'
import Deposit from './Clients/Client/Deposit/Deposit'
import DepositConfirm from './Clients/Client/Deposit/DepositConfirm/DepositConfirm'
import Edit from './Portfolios/Edit/Edit'
import Invites from './Invites/Invites'
import Navigation from './Navigation/Navigation'
import Portfolios from './Portfolios/Portfolios'
import Withdraw from './Clients/Client/Withdraw/Withdraw'
import WithdrawConfirm from './Clients/Client/Withdraw/WithdrawConfirm/WithdrawConfirm'

import './Advisor.css'

const Advisor = ({ clients, email, portfolios, setPortfolios }) => {
	return (
		<div className='Advisor'>
			<div className='Metadata'>
				<Link className='Logo' to='/'>
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
						<Route path='' element={<Clients clients={clients} portfolios={portfolios} />} />
						<Route path='clients' element={<Clients clients={clients} portfolios={portfolios} />} />
						<Route path='clients/client' element={<Client clients={clients} portfolios={portfolios} />} />
						<Route path='clients/client/deposit' element={<Deposit clients={clients} />} />
						<Route path='clients/client/deposit/depositconfirm' element={<DepositConfirm clients={clients} />} />
						<Route path='invites' element={<Invites />} />
						<Route path='portfolios' element={<Portfolios portfolios={portfolios} />} />
						<Route path='portfolios/assign' element={<Assign portfolios={portfolios} />} />
						<Route path='portfolios/confirm' element={<Confirm portfolios={portfolios} />} />
						<Route path='portfolios/edit' element={<Edit portfolios={portfolios} setPortfolios={setPortfolios} />} />
						<Route path='clients/client/withdraw' element={<Withdraw clients={clients} />} />
						<Route path='clients/client/withdrawconfirm' element={<WithdrawConfirm clients={clients} />} />
					</Routes>
				</div>
			</div>
		</div>
	)
}

export default Advisor
