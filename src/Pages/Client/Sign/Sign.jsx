import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Sign.css'

const agreementNames = {
	1: 'Investment Advisory Agreement',
	2: 'Privacy Policy',
	3: 'Form CRS',
	4: 'Form ADV Part 2A',
	5: 'Form ADV Part 2B'
}

const coinbaseURL =
	'https://www.coinbase.com/oauth/authorize?account=all&scope=wallet:accounts:read,wallet:accounts:update,wallet:accounts:create,wallet:accounts:delete,wallet:addresses:read,wallet:addresses:create,wallet:buys:read,wallet:buys:create,wallet:deposits:read,wallet:deposits:create,wallet:notifications:read,wallet:payment-methods:read,wallet:payment-methods:delete,wallet:payment-methods:limits,wallet:sells:read,wallet:sells:create,wallet:transactions:read,wallet:transactions:request,wallet:transactions:transfer,wallet:user:read,wallet:user:update,wallet:user:email,wallet:withdrawals:read,wallet:withdrawals:create&response_type=code&client_id=d41fd296f21919731b07190afcf278b4f7a7f2813d029bb48d81fbf872c8fae4'

const Sign = () => {
	const [searchParams] = useSearchParams()
	const advisorId = searchParams.get('advisorId')
	const advisorName = searchParams.get('advisorName')
	const clientEmail = searchParams.get('email')
	const firmName = searchParams.get('firmName')

	const [agreements, setAgreements] = useState({})
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		fetch(`https://blockria.com/api/agreements2?advisorId=${advisorId}`)
			.then(response => response.json())
			.then(setAgreements)
			.then(() => setIsLoading(false))
			.catch(alert)
	}, [])

	function renderAgreements() {
		return (
			<form onSubmit={null}>
				<div className='Title'>
					{advisorName} at {firmName} Needs to Connect to Your Accounts
				</div>
				<div>By connecting an account, I agree to:</div>
				{Object.keys(agreements).map(documentOrder => (
					<a
						className='Agreement'
						href={agreements[documentOrder].url}
						key={documentOrder}
						target='_blank'
						rel='noopener noreferrer'
					>
						{agreementNames[documentOrder]}
					</a>
				))}
				<a
					className='Button'
					href={`${coinbaseURL}&state=["${advisorId}","${clientEmail}"]`}
					rel='noopener noreferrer'
					style={{ marginTop: '32px' }}
					target='_blank'
				>
					Connect Your Coinbase Account
				</a>
				<Link className='Button' to={`/client/coinbasepro?clientEmail=${clientEmail}&advisorId=${advisorId}`}>
					Connect Your Coinbase Pro Account
				</Link>
			</form>
		)
	}

	function renderNoAgreements() {
		return (
			<form onSubmit={null}>
				<div className='Title'>
					{advisorName} at {firmName} Needs to Connect to Your Accounts
				</div>
				<a
					className='Button'
					href={`${coinbaseURL}&state=["${advisorId}","${clientEmail}"]`}
					rel='noopener noreferrer'
					target='_blank'
				>
					Connect Your Coinbase Account
				</a>
				<Link className='Button' to={`/client/coinbasepro?clientEmail=${clientEmail}&advisorId=${advisorId}`}>
					Connect Your Coinbase Pro Account
				</Link>
			</form>
		)
	}

	return (
		<div className='Sign NewForm NewFormWrapper'>
			{isLoading ? (
				<div className='Loading'>Loading...</div>
			) : Object.keys(agreements).length ? (
				renderAgreements()
			) : (
				renderNoAgreements()
			)}
		</div>
	)
}

export default Sign
