import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { demoClients } from '../demoData'
import './Clients.css'

function renderPortfolio(clientId, clientName, currentPortfolioId, portfolios) {
	const portfolio = portfolios.filter(({ portfolioId }) => portfolioId === currentPortfolioId)

	if (portfolio.length) {
		return (
			<>
				<svg viewBox='0 0 576 512'>
					<path d='M304 16.58C304 7.555 310.1 0 320 0C443.7 0 544 100.3 544 224C544 233 536.4 240 527.4 240H304V16.58zM32 272C32 150.7 122.1 50.34 238.1 34.25C248.2 32.99 256 40.36 256 49.61V288L412.5 444.5C419.2 451.2 418.7 462.2 411 467.7C371.8 495.6 323.8 512 272 512C139.5 512 32 404.6 32 272zM558.4 288C567.6 288 575 295.8 573.8 305C566.1 360.9 539.1 410.6 499.9 447.3C493.9 452.1 484.5 452.5 478.7 446.7L320 288H558.4z' />
				</svg>
				{/* <Link to={`/advisor/portfolios?portfolioId=${currentPortfolioId}`}>{portfolioName}</Link> ( */}
				{portfolio[0].portfolioName} (
				<Link
					to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=${currentPortfolioId}`}
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
				to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=`}
			>
				Assign a Portfolio
			</Link>
		</>
	)
}

const Clients = ({ advisor, portfolios, setPortfolios }) => {
	const [clients, setClients] = useState(JSON.parse(localStorage.getItem('clients')) || [] || demoClients)
	const [spotPrices, setSpotPrices] = useState({})

	useEffect(async () => {
		getClients()
		getPortfolios()
	}, [])

	function getClients() {
		setClients([])
		localStorage.setItem('clients', '[]')

		fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisor.idToken.payload.sub}`)
			.then(async response => {
				// Get Clients
				const newClients = await response.json()
				console.log({ newClients })
				setClients(newClients)
				localStorage.setItem('clients', JSON.stringify(newClients))

				// Get Spot Prices
				await getSpotPrices()
			})
			.catch(error => alert(error))
	}

	function getPortfolios() {
		setPortfolios([])
		localStorage.setItem('portfolios', '[]')

		return fetch(`https://blockria.com/api/portfolios?advisorId=${advisor.idToken.payload.sub}`)
			.then(async response => {
				const newPortfolios = await response.json()
				console.log({ newPortfolios })
				setPortfolios(newPortfolios)
				localStorage.setItem('portfolios', JSON.stringify(newPortfolios))
			})
			.catch(error => alert(error))
	}

	async function getSpotPrices() {
		// Format Holdings
		let currencies = {}
		clients.forEach(client => {
			client.holdings.forEach(account => {
				if (account.M.balance.M.currency.S !== 'USD') {
					currencies[account.M.balance.M.currency.S] = true
				}
			})
		})

		// GET Spot Prices
		const spotPricesResponse = await Promise.all(Object.keys(currencies).map(getSpotPrice))

		// Format Spot Prices
		let newSpotPrices = {}
		spotPricesResponse.forEach(({ data }) => (newSpotPrices[data.base] = Number(data.amount)))
		console.log(newSpotPrices)
		setSpotPrices(newSpotPrices)
	}

	function getSpotPrice(holding) {
		return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot`)
			.then(response => response.json())
			.catch(error => alert(error))
	}

	function renderClient({ clientId, clientName, holdings, portfolioId }) {
		let balance = 0
		holdings.forEach(account => {
			if (account.M.balance.M.currency.S in spotPrices) {
				balance += spotPrices[account.M.balance.M.currency.S] * Number(account.M.balance.M.amount.S)
			}
		})

		return (
			<tr key={clientId}>
				<td>
					<Link to={`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`}>{clientName}</Link>
				</td>
				<td>{balance && balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
				<td>
					{portfolioId
						? renderPortfolio(clientId, clientName, portfolioId, portfolios)
						: renderPortfolioAssign(clientName, clientId)}
				</td>
				<td>Coinbase</td>
			</tr>
		)
	}

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
						<th>Balance</th>
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
