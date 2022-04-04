import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Clients.css'

function getSpotPrice(holding) {
	return fetch(`https://blockria.com/v2/prices/${holding}-USD/spot`)
		.then(response => response.json())
		.catch(error => alert(error))
}

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
	const [clients, setClients] = useState([])

	useEffect(() => {
		setClients([])
		setPortfolios([])

		fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(handleNewClients)
			.catch(error => alert(error))

		fetch(`https://blockria.com/api/portfolios?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(setPortfolios)
			.catch(error => alert(error))
	}, [])

	async function handleNewClients(newClients) {
		console.log({ newClients })

		// [1.0] GET Spot Prices
		// [1.1] Format Currencies
		let currencies = {}
		newClients.forEach(({ holdings }) => {
			holdings.forEach(({ balance }) => {
				if (balance.currency !== 'USD') currencies[balance.currency] = true
			})
		})
		console.log({ currencies })

		// [1.2] GET Spot Prices
		const spotPricesResponse = await Promise.all(Object.keys(currencies).map(getSpotPrice))

		// [1.3] Format Spot Prices
		let spotPrices = { USD: 1 }
		spotPricesResponse.forEach(({ data }) => (spotPrices[data.base] = Number(data.amount)))
		console.log({ spotPrices })

		// [2.0] Calculate Total Native Balance for Each Client
		newClients.forEach(({ holdings }, index) => {
			let nativeBalance = 0
			holdings.forEach(({ balance }) => (nativeBalance += spotPrices[balance.currency] * balance.amount))
			newClients[index].nativeBalance = nativeBalance
		})

		// [3.0] Sort Clients by Total Native Balance
		newClients = newClients.sort((a, b) => b.nativeBalance - a.nativeBalance)
		console.log({ newClients })

		// [3.0] Update State
		setClients(newClients)
	}

	function renderClient({ clientId, clientName, nativeBalance, portfolioId }) {
		return (
			<tr key={clientId}>
				<td>
					<Link to={`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`}>{clientName}</Link>
				</td>
				<td>{nativeBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
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
