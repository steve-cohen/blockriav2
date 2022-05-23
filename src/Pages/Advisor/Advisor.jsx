import React, { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'

import Agreements from './Agreements/Agreements'
import Billing from './Billing/Billing'
import BillingEdit from './Billing/Edit/BillingEdit'
import Client from './Clients/Client/Client'
import Clients from './Clients/Clients'
import ClientOnboarding from './ClientOnboarding/ClientOnboarding'
import Deposit from './Clients/Client/Deposit/Deposit'
import EditPortfolio from './Portfolios/EditPortfolio/EditPorfolio'
import Invites from './Invites/Invites'
import Navigation from './Navigation/Navigation'
import Overview from './Overview/Overview'
import Portfolios from './Portfolios/Portfolios'
import SetBilling from './Clients/Client/SetBilling/SetBilling'
import SetPortfolio from './Clients/Client/SetPortfolio/SetPortfolio'
import Settings from './Settings/Settings'
import SignIn from './SignIn/SignIn'
import SignUp from './SignUp/SignUp'
// import Support from './Support/Support'
import Taxes from './Taxes/Taxes'
import TaxEvents from './Clients/Client/TaxEvents/TaxEvents'
import Transactions from './Clients/Client/Transactions/Transactions'
import Withdrawal from './Clients/Client/Withdrawal/Withdrawal'
import VerifyEmail from './VerifyEmail/VerifyEmail'

import { demoAdvisorEmpty } from './demoData'

import './Advisor.css'

const Advisor = () => {
	const [advisor, setAdvisor] = useState(JSON.parse(localStorage.getItem('advisor')) || demoAdvisorEmpty)

	return (
		<div className='Advisor'>
			<div className='Content'>
				<Navigation />
				<div className='Body'>
					<Routes>
						{advisor.idToken.payload.sub ? (
							<>
								<Route path='' element={<Overview advisor={advisor} />} />
								<Route path='agreements' element={<Agreements advisor={advisor} />} />
								<Route path='billing' element={<Billing advisor={advisor} />} />
								<Route path='billing/edit' element={<BillingEdit advisor={advisor} />} />
								<Route path='clients' element={<Clients advisor={advisor} />} />
								<Route path='clients/client' element={<Client advisor={advisor} />} />
								<Route path='clients/client/deposit' element={<Deposit advisor={advisor} />} />
								<Route path='clients/client/setbilling' element={<SetBilling advisor={advisor} />} />
								<Route path='clients/client/setportfolio' element={<SetPortfolio advisor={advisor} />} />
								<Route path='clients/client/taxevents' element={<TaxEvents />} />
								<Route path='clients/client/transactions' element={<Transactions />} />
								<Route path='clients/client/withdrawal' element={<Withdrawal advisor={advisor} />} />
								<Route path='invites' element={<Invites advisor={advisor} />} />
								<Route path='portfolios' element={<Portfolios advisor={advisor} />} />
								<Route path='portfolios/edit' element={<EditPortfolio advisor={advisor} />} />
								<Route path='settings' element={<Settings advisor={advisor} />} />
								{/* <Route path='support' element={<Support advisor={advisor} />} /> */}
								<Route path='taxes' element={<Taxes advisor={advisor} />} />
								<Route path='*' element={<Navigate to='' />} />
							</>
						) : (
							<Route path='*' element={<Navigate to='signin' />} />
						)}
						<Route path='clientonboarding' element={<ClientOnboarding />} />
						<Route path='signin' element={<SignIn setAdvisor={setAdvisor} />} />
						<Route path='signup' element={<SignUp />} />
						<Route path='verifyemail' element={<VerifyEmail />} />
					</Routes>
				</div>
			</div>
		</div>
	)
}

export default Advisor
