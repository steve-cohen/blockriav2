import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import coinbaseTokenNames from '../coinbaseTokenNames.json'
import './Portfolios.css'

function formatPercent(number) {
	return (number / 100).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'percent'
	})
}

function formatUSD(number) {
	return number.toLocaleString('en-US', {
		currency: 'USD',
		style: 'currency'
	})
}

function getSpotPrice(holding, timePeriod = '') {
	let url = `https://blockria.com/v2/prices/${holding}-USD/spot`

	if (timePeriod) {
		let date = new Date()
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
				date.setMonth(1)
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

const Portfolios = ({ advisor, portfolios, setPortfolios }) => {
	const [showPortfolios, setShowPortfolios] = useState([])
	const [performances, setPerformances] = useState({})
	const [portfolioCountTotals, setPortfolioCountTotals] = useState({})
	const [spotPrices, setSpotPrices] = useState({})

	useEffect(async () => {
		setPortfolios([])

		// [0.0] GET Portfolio Count Totals
		const newClients = await fetch(`https://blockria.com/api/coinbase/clients?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.catch(error => alert(error))
		console.log({ newClients })

		let newPortfolioCountTotals = {}
		newClients.forEach(({ portfolioId }) => {
			if (portfolioId in newPortfolioCountTotals) newPortfolioCountTotals[portfolioId] += 1
			else newPortfolioCountTotals[portfolioId] = 1
		})
		console.log({ newPortfolioCountTotals })

		// [1.0] GET Portfolios
		const newPortfolios = await fetch(`https://blockria.com/api/portfolios?advisorId=${advisor.idToken.payload.sub}`)
			.then(response => response.json())
			.catch(error => alert(error))
		console.log({ newPortfolios })

		// [2.0] GET Spot Prices
		// [2.1] Format Currencies
		let currencies = {}
		newPortfolios.forEach(({ allocations }) => {
			allocations.forEach(({ holding }) => {
				if (holding !== 'USD') currencies[holding] = true
			})
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

		// [3.0] Calculate Performance
		let newPerformances = {}
		Object.keys(newSpotPrices).forEach(holdingDate => {
			const holding = holdingDate.split('-')[0]
			const performance = (100 * (newSpotPrices[holding] - newSpotPrices[holdingDate])) / newSpotPrices[holdingDate]
			newPerformances[holdingDate] = performance > 0 ? `+${formatPercent(performance)}` : formatPercent(performance)
		})
		console.log({ newPerformances })

		// [3.0] Set State
		setShowPortfolios(newPortfolios.map(() => false))
		setPerformances(newPerformances)
		setSpotPrices(newSpotPrices)
		setPortfolioCountTotals(newPortfolioCountTotals)
		setPortfolios(newPortfolios)
	}, [])

	function handleShowPortfolio(index) {
		let newShowPortfolios = [...showPortfolios]
		newShowPortfolios[index] = !newShowPortfolios[index]
		setShowPortfolios(newShowPortfolios)
	}

	function renderPortfolios({ allocations, portfolioId, portfolioName }, index) {
		return (
			<React.Fragment key={`Portfolio ${portfolioId}`}>
				<tr className='Bold PortfolioTrack' onClick={() => handleShowPortfolio(index)}>
					<td>
						<svg style={showPortfolios[index] ? { transform: 'scaleY(-1)' } : {}} viewBox='0 0 384 512'>
							<path d='M192 384c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L192 306.8l137.4-137.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-160 160C208.4 380.9 200.2 384 192 384z' />
						</svg>
						{portfolioName}
					</td>
					<td />
					<td />
					<td />
					<td />
					<td className='AlignRight'>{renderPortfolioPerformance(allocations, '1D')}</td>
					<td className='AlignRight'>{renderPortfolioPerformance(allocations, '1W')}</td>
					<td className='AlignRight'>{renderPortfolioPerformance(allocations, '1M')}</td>
					<td className='AlignRight'>{renderPortfolioPerformance(allocations, '3M')}</td>
					<td className='AlignRight'>{renderPortfolioPerformance(allocations, 'YTD')}</td>
					<td className='AlignRight'>{renderPortfolioPerformance(allocations, '1Y')}</td>
					<td className='AlignRight Break'>
						{portfolioCountTotals[portfolioId] !== 1
							? `${portfolioCountTotals[portfolioId] || 0} Clients`
							: `${portfolioCountTotals[portfolioId]} Client`}
					</td>
					<td>
						<Link to={`/advisor/portfolios/edit?portfolioId=${portfolioId}`}>Edit Portfolio</Link>
					</td>
				</tr>
				{showPortfolios[index] ? renderPortfolioAllocations(allocations, index) : null}
			</React.Fragment>
		)
	}

	function renderPortfolioAllocations(allocations, index) {
		return (
			<React.Fragment key={`Allocations ${index}`}>
				{allocations
					.sort((a, b) => b.percent - a.percent)
					.map(({ holding, percent }, index) => (
						<tr key={`Allocation ${index}`}>
							<td />
							<td className='AlignRight'>{formatPercent(percent)}</td>
							<td>
								<a
									href={`https://coinbase.com/price/${coinbaseTokenNames[holding].replace(/ /g, '-').toLowerCase()}`}
									target='_blank'
									rel='noopener noreferrer'
								>
									{holding}
								</a>
							</td>
							<td>{coinbaseTokenNames[holding]}</td>
							<td className='AlignRight'>{formatUSD(spotPrices[holding])}</td>
							<td className={`AlignRight ${performances[holding + '-1D'].includes('+') ? 'Green' : 'Red'}`}>
								{performances[holding + '-1D']}
							</td>
							<td className={`AlignRight ${performances[holding + '-1W'].includes('+') ? 'Green' : 'Red'}`}>
								{performances[holding + '-1W']}
							</td>
							<td className={`AlignRight ${performances[holding + '-1M'].includes('+') ? 'Green' : 'Red'}`}>
								{performances[holding + '-1M']}
							</td>
							<td className={`AlignRight ${performances[holding + '-3M'].includes('+') ? 'Green' : 'Red'}`}>
								{performances[holding + '-3M']}
							</td>
							<td className={`AlignRight ${performances[holding + '-YTD'].includes('+') ? 'Green' : 'Red'}`}>
								{performances[holding + '-YTD']}
							</td>
							<td className={`AlignRight ${performances[holding + '-1Y'].includes('+') ? 'Green' : 'Red'}`}>
								{performances[holding + '-1Y']}
							</td>
							<td className='AlignRight Break'></td>
							<td></td>
						</tr>
					))}
				<tr>
					<td colSpan={13} />
				</tr>
			</React.Fragment>
		)
	}

	function renderPortfolioPerformance(allocations, timePeriod) {
		let totalPercentReturn = 0
		allocations.forEach(({ holding, percent }) => {
			const currentPrice = spotPrices[holding]
			const yesterdaysPrice = spotPrices[`${holding}-${timePeriod}`]
			const weighting = percent

			const percentReturn = (currentPrice - yesterdaysPrice) / yesterdaysPrice
			totalPercentReturn += weighting * percentReturn
		})

		return (totalPercentReturn > 0 ? '+' : '') + formatPercent(totalPercentReturn)
	}

	return (
		<table className='Portfolios'>
			<caption>
				<div className='Flex'>
					<div className='Title'>Portfolios</div>
					<Link className='Button' to={`/advisor/portfolios/edit`}>
						Create Portfolio
					</Link>
				</div>
			</caption>
			<thead>
				<tr>
					<th>PORTFOLIO</th>
					<th>ALLOCATION</th>
					<th>HOLDING</th>
					<th>NAME</th>
					<th className='AlignRight'>SPOT PRICE</th>
					<th className='AlignRight'>1D</th>
					<th className='AlignRight'>1W</th>
					<th className='AlignRight'>1M</th>
					<th className='AlignRight'>3M</th>
					<th className='AlignRight'>YTD</th>
					<th className='AlignRight'>1Y</th>
					<th className='AlignRight'>ASSIGNED TO</th>
					<th>EDIT</th>
				</tr>
			</thead>
			<tbody>{portfolios.map(renderPortfolios)}</tbody>
			<tfoot>
				<tr>
					<td colSpan={3}>
						<Link to='/advisor/portfolios/edit'>+ Create Portfolio</Link>
					</td>
				</tr>
			</tfoot>
		</table>
	)
}

export default Portfolios
