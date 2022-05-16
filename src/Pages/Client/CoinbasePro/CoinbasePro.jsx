import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './CoinbasePro.css'

const Sign = () => {
	const [searchParams] = useSearchParams()
	const [apiSecret, setApiSecret] = useState('')
	const [apiKey, setApiKey] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [passphrase, setPassphrase] = useState('')

	async function handleSubmit(e) {
		e.preventDefault()

		// Test the Keys

		// Upload the Keys

		// Navigate
	}

	return (
		<div className='CoinbasePro NewForm'>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Connect Your Coinbase Pro Account</div>
				<div style={{ margin: '24px 0 24px 2px' }}>
					{'1. '}
					<a href='https://pro.coinbase.com/profile/api' target='_blank' rel='noopener noreferrer'>
						Create a New API Key on Coinbase Pro
					</a>
				</div>
				<div>2. Add Your Passphrase, API Secret, and API Key</div>
				<input onChange={e => setPassphrase(e.target.value)} placeholder='Passphrase (Ex: brgngzcssh)' required />
				<input
					onChange={e => setApiSecret(e.target.value)}
					placeholder='API Secret (Ex: 1duAX0r4j8qEg40raTtPGJ+LgWnbspqZ6Gnq1Wq3eHTb6mBYh1cA+JiNmTopuzIDfzga5e4jeIH/c8nCqnZU1g==)'
					required
				/>
				<input
					onChange={e => setApiKey(e.target.value)}
					placeholder='API Key (Ex: 403b73dc1b819672f669d2ce46ff79ef)'
					required
				/>
				<input className='Continue' type='submit' value='Connect Coinbase Pro' />
			</form>
		</div>
	)
}

export default Sign
