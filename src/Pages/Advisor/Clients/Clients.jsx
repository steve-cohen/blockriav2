import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { demoClients } from '../demoData'
import './Clients.css'

function renderPortfolio(clientId, clientName, currentPortfolioId, portfolios) {
	const portfolio = portfolios.filter(({ portfolioId }) => portfolioId.S === currentPortfolioId)

	if (portfolio.length) {
		return (
			<>
				<svg viewBox='0 0 576 512'>
					<path d='M304 16.58C304 7.555 310.1 0 320 0C443.7 0 544 100.3 544 224C544 233 536.4 240 527.4 240H304V16.58zM32 272C32 150.7 122.1 50.34 238.1 34.25C248.2 32.99 256 40.36 256 49.61V288L412.5 444.5C419.2 451.2 418.7 462.2 411 467.7C371.8 495.6 323.8 512 272 512C139.5 512 32 404.6 32 272zM558.4 288C567.6 288 575 295.8 573.8 305C566.1 360.9 539.1 410.6 499.9 447.3C493.9 452.1 484.5 452.5 478.7 446.7L320 288H558.4z' />
				</svg>
				{/* <Link to={`/advisor/portfolios?portfolioId=${currentPortfolioId}`}>{portfolioName}</Link> ( */}
				{portfolio[0].portfolioName.S} (
				<Link
					to={`/advisor/portfolios/assign?clientName=${clientName}&clientId=${clientId}&portfolioId=${currentPortfolioId}`}
				>
					change
				</Link>
				)
			</>
		)
	}

	return null
}

function renderPortfolioAssign(clientName, clientId) {
	return (
		<>
			<svg className='AssignPortfolio' viewBox='0 0 512 512'>
				<path d='M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z' />
			</svg>
			<Link
				className='AssignPortfolio'
				to={`/advisor/portfolios/assign?clientName=${clientName}&clientId=${clientId}&portfolioId=`}
			>
				Assign a Portfolio
			</Link>
		</>
	)
}

const Clients = ({ advisor, portfolios, setPortfolios }) => {
	const [clients, setClients] = useState(JSON.parse(localStorage.getItem('clients')) || [] || demoClients)

	useEffect(async () => {
		setClients([])
		setPortfolios([])
		const [newClients, newPortfolios] = await Promise.all([getClients(), getPortfolios()])
		setClients(newClients)
		setPortfolios(newPortfolios)

		localStorage.setItem('clients', JSON.stringify(newClients))
		localStorage.setItem('portfolios', JSON.stringify(newPortfolios))
		console.log({ newClients, newPortfolios })
	}, [])

	function getClients() {
		return fetch(`https://blockria.com/advisor/clients?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.catch(error => alert(error))
	}

	function getPortfolios() {
		return fetch(`https://blockria.com/portfolios/query?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.catch(error => alert(error))
	}

	function renderClient({ clientId, clientName, nonzeroAccounts, portfolioId }) {
		nonzeroAccounts = JSON.parse(nonzeroAccounts.S)

		// Calculate Client's Total Native Balance and Native Currency
		let balance = 0
		let native_currency = 'USD'
		nonzeroAccounts.forEach(({ native_balance }) => {
			if (native_balance && native_balance.amount) {
				balance += Number(native_balance.amount)
				native_currency = native_balance.currency
			}
		})

		return (
			<tr key={clientId.S}>
				<td>
					<Link to={`/advisor/clients/client?clientName=${clientName.S}&clientId=${clientId.S}`}>{clientName.S}</Link>
				</td>
				{/* <td>{balance.toLocaleString('en-US', { style: 'currency', currency: native_currency })}</td> */}
				<td>
					{portfolioId.S
						? renderPortfolio(clientId.S, clientName.S, portfolioId.S, portfolios)
						: renderPortfolioAssign(clientName.S, clientId.S)}
				</td>
				<td>Coinbase</td>
			</tr>
		)
	}

	// function renderTotalNativeBalance() {
	// 	let totalNativeBalance = 0
	// 	let totalNativeCurrency = 'USD'

	// 	clients.forEach(({ nonzeroAccounts }) => {
	// 		nonzeroAccounts = JSON.parse(nonzeroAccounts.S)

	// 		nonzeroAccounts.forEach(({ native_balance }) => {
	// 			if (native_balance && native_balance.amount) {
	// 				totalNativeBalance += Number(native_balance.amount)
	// 				totalNativeCurrency = native_balance.currency
	// 			}
	// 		})
	// 	})

	// 	return (
	// 		<div className='TotalNativeBalance'>
	// 			{`Total Balance: ${totalNativeBalance.toLocaleString('en-US', {
	// 				style: 'currency',
	// 				currency: totalNativeCurrency
	// 			})}`}
	// 		</div>
	// 	)
	// }

	return (
		<div className='Clients'>
			<div className='Title'>Clients</div>
			<div className='Options'>
				{/* {renderTotalNativeBalance()} */}
				<div></div>
				<div>
					{/* <div className='Option2'>Export CSV</div> */}
					<Link className='Option1' to='/advisor/invites'>
						Invite Client
					</Link>
				</div>
			</div>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						{/* <th>Balance</th> */}
						<th>Portfolio</th>
						<th>Custodian</th>
					</tr>
				</thead>
				<tbody>{clients && portfolios ? clients.map(renderClient) : null}</tbody>
			</table>
			<Link className='Option0' to='/advisor/invites'>
				+ Invite Client
			</Link>
		</div>
	)
}

export default Clients
