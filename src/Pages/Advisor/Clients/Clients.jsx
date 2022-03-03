import React from 'react'
import { Link } from 'react-router-dom'
import './Clients.css'

function renderClient({ clientId, clientName, nonzeroAccounts, portfolioId }, portfolios) {
	nonzeroAccounts = JSON.parse(nonzeroAccounts.S)

	// Render Client's Total Native Balance and Native Currency
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
				<Link to={`/advisor/client`}>{clientName.S}</Link>
			</td>
			<td>{balance.toLocaleString('en-US', { style: 'currency', currency: native_currency })}</td>
			<td>
				{portfolioId.S ? (
					<>
						<svg viewBox='0 0 512 512'>
							<path d='M421.7 220.3L188.5 453.4L154.6 419.5L158.1 416H112C103.2 416 96 408.8 96 400V353.9L92.51 357.4C87.78 362.2 84.31 368 82.42 374.4L59.44 452.6L137.6 429.6C143.1 427.7 149.8 424.2 154.6 419.5L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3zM492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75z' />
						</svg>
						<Link to={`/advisor/portfolios?portfolioId=${portfolioId.S}`}>
							{portfolios.filter(portfolio => portfolio.portfolioId.S === portfolioId.S)[0].portfolioName.S}
						</Link>
					</>
				) : (
					<>
						<svg className='Assign' viewBox='0 0 512 512'>
							<path d='M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z' />
						</svg>
						<Link className='Assign' to={`/advisor/client/assignportfolio`}>
							Assign a Portfolio
						</Link>
					</>
				)}
			</td>
			<td>Coinbase</td>
		</tr>
	)
}

const Clients = ({ clients, portfolios }) => {
	return (
		<div className='Clients'>
			<div className='Title'>Clients</div>
			<div className='Options'>
				<div></div>
				<div>
					<div className='ButtonExport'>Export CSV</div>
					<Link className='ButtonInvite' to='/invites'>
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
				<tbody>{clients.map(client => renderClient(client, portfolios))}</tbody>
			</table>
			<Link className='InviteClientBottom' to='/invites'>
				+ Invite Client
			</Link>
		</div>
	)
}

export default Clients
