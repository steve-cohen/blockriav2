import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './Sign.css'

const coinbaseURL =
	'https://www.coinbase.com/oauth/authorize?account=all&scope=wallet:accounts:read,wallet:accounts:update,wallet:accounts:create,wallet:accounts:delete,wallet:addresses:read,wallet:addresses:create,wallet:buys:read,wallet:buys:create,wallet:deposits:read,wallet:deposits:create,wallet:notifications:read,wallet:payment-methods:read,wallet:payment-methods:delete,wallet:payment-methods:limits,wallet:sells:read,wallet:sells:create,wallet:transactions:read,wallet:transactions:request,wallet:transactions:transfer,wallet:user:read,wallet:user:update,wallet:user:email,wallet:withdrawals:read,wallet:withdrawals:create&response_type=code&client_id=d41fd296f21919731b07190afcf278b4f7a7f2813d029bb48d81fbf872c8fae4'

const Sign = () => {
	const [searchParams] = useSearchParams()
	const [agreements, setAgreements] = useState({})
	const [isLoading, setIsLoading] = useState(true)

	useEffect(async () => {
		await fetch(`https://blockria.com/api/agreements2?advisorId=${searchParams.get('advisorId')}`)
			.then(response => response.json())
			.then(setAgreements)
			.then(() => setIsLoading(false))
			.catch(alert)
	}, [])

	function renderAgreementLink(documentOrder) {
		return (
			<a
				className='Agreement'
				href={agreements[documentOrder].url}
				key={documentOrder}
				target='_blank'
				rel='noopener noreferrer'
			>
				- {renderAgreementName(documentOrder)}
			</a>
		)
	}

	function renderAgreementName(documentOrder) {
		switch (documentOrder) {
			case '1':
				return 'Investment Advisory Agreement (Client Agreement)'
			case '2':
				return 'Privacy Policy'
			case '3':
				return 'Form CRS'
			case '4':
				return 'Form ADV Part 2A'
			case '5':
				return 'Form ADV Part 2B'
			default:
				return ''
		}
	}

	function renderAgreements() {
		if (isLoading) return <div className='Loading'>Loading...</div>

		if (Object.keys(agreements).length) {
			return (
				<>
					<div className='Title'>
						Client Agreements for {searchParams.get('advisorName')} at {searchParams.get('firmName')}
					</div>
					<div className='SubTitle'>By clicking the button below, I agree to:</div>
					{Object.keys(agreements).map(renderAgreementLink)}
					<div
						className='Agree'
						onClick={() =>
							window.location.replace(
								`${coinbaseURL}&state=["${searchParams.get('advisorId')}","${searchParams.get('email')}"]`
							)
						}
					>
						Agree
					</div>
				</>
			)
		} else {
			return (
				<>
					<div className='Title'>
						{searchParams.get('advisorName')} at {searchParams.get('firmName')} wants to connect to your Coinbase
						account
					</div>
					<div
						className='Agree'
						onClick={() =>
							window.location.replace(
								`${coinbaseURL}&state=["${searchParams.get('advisorId')}","${searchParams.get('email')}"]`
							)
						}
					>
						Agree
					</div>
				</>
			)
		}
	}

	return (
		<div className='Sign'>
			<div className='Agreements'>{renderAgreements()}</div>
		</div>
	)
}

export default Sign
