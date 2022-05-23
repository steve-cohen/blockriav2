import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

function renderPortfolio(clientId, clientName, currentPortfolioId, portfolios, rebalanceFrequency) {
	const portfolio = portfolios.filter(({ portfolioId }) => portfolioId === currentPortfolioId)

	if (portfolio.length) {
		return (
			<>
				{portfolio[0].portfolioName} (
				<Link
					id='Change'
					to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=${currentPortfolioId}&rebalanceFrequency=${rebalanceFrequency}`}
					style={{ textTransform: 'none' }}
				>
					change
				</Link>
				)
			</>
		)
	}

	return null
}

function renderPortfolioAssign(clientName, clientId, rebalanceFrequency) {
	return (
		<Link
			className='Red'
			id='Assign'
			to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=&rebalanceFrequency=${rebalanceFrequency}`}
			style={{ textTransform: 'none' }}
		>
			No Portfolio
		</Link>
	)
}

const Clients = ({ advisor }) => {
	const advisorId = advisor.idToken.payload.sub
	const navigate = useNavigate()
	const [clients, setClients] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [portfolios, setPortfolios] = useState([])

	useEffect(async () => {
		setPortfolios([])
		await Promise.all([GETClients(), GETPortfolios()])
		await setIsLoading(false)
	}, [])

	async function GETClients() {
		const [coinbase, coinbasePro] = await Promise.all([GETClientsCoinbase(), GETClientsCoinbasePro()])
		handleNewClients([...coinbase, ...coinbasePro])
	}

	function GETClientsCoinbase() {
		return fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisorId}`)
			.then(response => response.json())
			.catch(alert)
	}

	function GETClientsCoinbasePro() {
		return fetch(`https://blockria.com/api/coinbasepro/clients?advisorId=${advisorId}`)
			.then(response => response.json())
			.catch(alert)
	}

	function GETPortfolios() {
		return fetch(`https://blockria.com/api/portfolios?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(setPortfolios)
			.catch(alert)
	}

	function handeClient(e, clientId, clientName) {
		e.preventDefault()
		if (e.target.id !== 'Assign' && e.target.id !== 'Change') {
			navigate(`/advisor/clients/client?clientName=${clientName}&clientId=${clientId}`)
		}
	}

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

	function renderClient({
		clientId,
		clientName,
		createdAt,
		custodian,
		nativeBalance,
		portfolioId,
		rebalanceFrequency
	}) {
		return (
			<tr key={clientId} onClick={e => handeClient(e, clientId, clientName)}>
				<td className='ClientName'>{clientName}</td>
				<td className='AlignRight Bold'>{formatUSD(nativeBalance)}</td>
				<td>
					{portfolioId
						? renderPortfolio(clientId, clientName, portfolioId, portfolios)
						: renderPortfolioAssign(clientName, clientId)}
				</td>
				{renderRebalanceFrequency(clientName, clientId, portfolioId, rebalanceFrequency)}
				<td>{clientId.includes('-') ? 'Coinbase' : 'Coinbase Pro'}</td>
				{/* <td>{new Date(updatedAt).toISOString().slice(0, 19).replace('T', ' ')}</td> */}
				<td>{new Date(createdAt).toISOString().slice(0, 10)}</td>
			</tr>
		)
	}

	function renderRebalanceFrequency(clientName, clientId, portfolioId, rebalanceFrequency) {
		if (rebalanceFrequency) {
			return (
				<td className='Break'>
					<span>Rebalance {rebalanceFrequency} </span>(
					<Link
						id='Change'
						to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=${portfolioId}&rebalanceFrequency=${rebalanceFrequency}`}
						style={{ textTransform: 'none' }}
					>
						change
					</Link>
					)
				</td>
			)
		}

		return <td className='Break' />
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
						{assignedPortfolios}
						{assignedPortfolios === 1 ? ' Portfolio Assigned' : ' Portfolios Assigned'}
					</td>
				</tr>
			</tfoot>
		)
	}

	return (
		<div className='ResponsiveTable'>
			<table className='Clients'>
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
						<th className='Break'>PORTFOLIO REBALANCING</th>
						<th>CUSTODIAN</th>
						{/* <th>UPDATED</th> */}
						<th>JOINED</th>
					</tr>
				</thead>
				{isLoading ? (
					<tbody>
						<tr>
							<td style={{ border: 'none' }}>
								<div className='Loading'>Loading...</div>
							</td>
						</tr>
					</tbody>
				) : (
					<>
						<tbody>{clients.map(renderClient)}</tbody>
						{renderTotals()}
					</>
				)}
			</table>
		</div>
	)
}

export default Clients
