import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Clients.css'

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

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
			<Link
				className='Bold Red'
				to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=`}
			>
				Assign Portfolio
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

	function renderClient({ clientId, clientName, createdAt, nativeBalance, portfolioId, updatedAt }) {
		return (
			<tr key={clientId}>
				<td className='Bold'>
					<Link to={`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`}>{clientName}</Link>
				</td>
				<td className='AlignRight Bold'>
					{nativeBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
				</td>
				<td className='Break'>
					{portfolioId
						? renderPortfolio(clientId, clientName, portfolioId, portfolios)
						: renderPortfolioAssign(clientName, clientId)}
				</td>
				<td>Coinbase</td>
				<td>{new Date(updatedAt).toISOString().slice(0, 19).replace('T', ' ')}</td>
				<td>{new Date(createdAt).toISOString().slice(0, 19).replace('T', ' ')}</td>
			</tr>
		)
	}

	function renderTotals() {
		let assignedPortfolios = 0
		let balance = 0
		clients.forEach(({ nativeBalance, portfolioId }) => {
			balance += nativeBalance
			if (portfolioId) assignedPortfolios += 1
		})

		return (
			<tfoot>
				<tr>
					<td>{clients.length !== 1 ? `${clients.length} Clients` : '1 Client'}</td>
					<td className='AlignRight Bold'>{formatUSD(balance)}</td>
					<td className='Break' colSpan={4}>
						{assignedPortfolios} / {clients.length} Portfolios Assigned
					</td>
				</tr>
			</tfoot>
		)
	}

	return (
		<table>
			<caption>
				<div className='Flex'>
					<div className='Title'>Clients</div>
					<Link className='Button' to={`/advisor/invites`}>
						Invite Client
					</Link>
				</div>
			</caption>
			<thead>
				<tr>
					<th>NAME</th>
					<th className='AlignRight'>BALANCE</th>
					<th>PORTFOLIO</th>
					<th>CUSTODIAN</th>
					<th>UPDATED</th>
					<th>CREATED</th>
				</tr>
			</thead>
			<tbody>{clients.map(renderClient)}</tbody>
			{renderTotals()}
		</table>
	)
}

export default Clients
