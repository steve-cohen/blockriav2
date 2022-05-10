import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function formatPercent(number) {
	return (number / 100).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'percent'
	})
}

function getSpotPrice(holding, timePeriod = '') {
	let url = `https://blockria.com/v2/prices/${holding}-USD/spot`

	if (timePeriod) {
		let date = new Date()
		date.setHours(0)
		date.setMinutes(0)
		date.setSeconds(0)
		date.setMilliseconds(0)

		switch (timePeriod) {
			case '1D':
				date.setDate(date.getDate() - 1)
				break
			case '1W':
				date.setDate(date.getDate() - 7)
				break
			case '1M':
				date.setMonth(date.getMonth() - 1)
				break
			case '3M':
				date.setMonth(date.getMonth() - 3)
				break
			case 'YTD':
				date.setDate(1)
				date.setMonth(0)
				break
			case '1Y':
				date.setFullYear(date.getFullYear() - 1)
				break
			default:
				break
		}
		url += `?date=${date.toISOString().slice(0, 10)}`
	}

	return fetch(url)
		.then(response => response.json())
		.then(response => {
			const key = timePeriod ? `${response.data.base}-${timePeriod}` : response.data.base
			const value = Number(response.data.amount)
			return { [key]: value }
		})
		.catch(error => alert(error))
}

const ClientPortfolio = ({ advisor, client }) => {
	const { portfolioId, rebalanceFrequency } = client

	const [searchParams] = useSearchParams()
	const clientId = searchParams.get('clientId')
	const clientName = searchParams.get('clientName')

	const [isLoading, setIsLoading] = useState(false)
	const [portfolio, setPortfolio] = useState({})
	const [spotPrices, setSpotPrices] = useState({})

	useEffect(async () => {
		if (!portfolioId) return
		setIsLoading(true)

		await fetch(
			`https://blockria.com/api/coinbase/clients/client/portfolio?advisorId=${advisor.idToken.payload.sub}&portfolioId=${portfolioId}`
		)
			.then(response => response.json())
			.then(newPortfolio => {
				setIsLoading(false)
				setPortfolio(newPortfolio)
			})
			.catch(alert)

		setIsLoading(false)
	}, [advisor, portfolioId])

	useEffect(async () => {
		if (portfolio.allocations === undefined) return

		// [2.0] GET Spot Prices
		// [2.1] Format Currencies
		let currencies = {}
		portfolio.allocations.forEach(({ holding }) => {
			if (holding !== 'USD') currencies[holding] = true
		})
		console.log({ currencies })

		// [2.2] GET Spot Prices
		const spotPricesResponse = await Promise.all([
			...Object.keys(currencies).map(holding => getSpotPrice(holding)),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1D')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1W')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1M')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '3M')),
			...Object.keys(currencies).map(c => getSpotPrice(c, 'YTD')),
			...Object.keys(currencies).map(c => getSpotPrice(c, '1Y'))
		])
		console.log({ spotPricesResponse })

		// [2.3] Format Spot Prices
		let newSpotPrices = { USD: 1, 'USD-1D': 1, 'USD-1W': 1, 'USD-1M': 1, 'USD-3M': 1, 'USD-YTD': 1, 'USD-1Y': 1 }
		spotPricesResponse.forEach(newSpotPrice => (newSpotPrices = { ...newSpotPrice, ...newSpotPrices }))
		console.log({ newSpotPrices })
		setSpotPrices(newSpotPrices)
	}, [portfolio])

	function renderPortfolioPerformance(portfolio, timePeriod) {
		if (portfolio.allocations === undefined) return null

		let totalPercentReturn = 0
		portfolio.allocations.forEach(({ holding, percent }) => {
			if (holding in spotPrices && [`${holding}-${timePeriod}`] in spotPrices) {
				const currentPrice = spotPrices[holding]
				const yesterdaysPrice = spotPrices[`${holding}-${timePeriod}`]
				const weighting = percent

				const percentReturn = (currentPrice - yesterdaysPrice) / yesterdaysPrice
				totalPercentReturn += weighting * percentReturn
			}
		})

		if (totalPercentReturn > 0) {
			return <td className='AlignRight Green'>+{formatPercent(totalPercentReturn)}</td>
		} else {
			return <td className='AlignRight Red'>{formatPercent(totalPercentReturn)}</td>
		}
	}

	return (
		<table>
			<caption>
				<div className='Flex'>
					<div className='Title'>Automatic Portfolio Rebalancing</div>
					<Link
						className='Button'
						to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=${portfolioId}`}
					>
						{portfolioId ? 'Change Portfolio' : 'Assign a Portfolio'}
					</Link>
				</div>
			</caption>
			<thead>
				<tr>
					<th>PORTFOLIO</th>
					<th className='Break'>AUTOMATIC REBALANCING FREQUENCY</th>
					<th className='AlignRight'>1D</th>
					<th className='AlignRight'>1W</th>
					<th className='AlignRight'>1M</th>
					<th className='AlignRight'>3M</th>
					<th className='AlignRight'>YTD</th>
					<th className='AlignRight'>1Y</th>
				</tr>
			</thead>
			<tbody>
				{isLoading ? (
					<tr>
						<td className='Loading' style={{ borderBottom: 'none' }}>
							Loading...
						</td>
					</tr>
				) : null}
				{!isLoading && portfolioId ? (
					<tr>
						<td>
							<span className='Bold'>{portfolio.portfolioName}</span>
						</td>
						<td className='Break'>
							<span className='Bold'>{rebalanceFrequency} Rebalancing</span>
						</td>
						{renderPortfolioPerformance(portfolio, '1D')}
						{renderPortfolioPerformance(portfolio, '1W')}
						{renderPortfolioPerformance(portfolio, '1M')}
						{renderPortfolioPerformance(portfolio, '3M')}
						{renderPortfolioPerformance(portfolio, 'YTD')}
						{renderPortfolioPerformance(portfolio, '1Y')}
					</tr>
				) : (
					<tr>
						<td className='Bold Red' style={{ borderBottom: 'none' }}>
							<Link
								className='Red'
								to={`/advisor/clients/client/setPortfolio?clientName=${clientName}&clientId=${clientId}&portfolioId=${portfolioId}`}
							>
								Assign a Portfolio
							</Link>
						</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}

export default ClientPortfolio
