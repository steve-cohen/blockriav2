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
		<div className='CoinbasePro NewForm' style={{ fontWeight: 400 }}>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Connect Your Coinbase Pro Account</div>
				<div style={{ margin: '24px 0 24px 2px' }}>
					{'1. '}
					<a href='https://pro.coinbase.com/profile/api' target='_blank' rel='noopener noreferrer'>
						<b>Visit Coinbase Pro's API Page</b>
					</a>
				</div>
				<div>
					2. Click <b>+ New API Key</b>
				</div>
				<div>
					3. Under <b>Permissions</b>, select <b>View</b>, <b>Transfer</b>, and <b>Trade</b>
				</div>
				<div>
					4. Copy the <b>Passphrase</b>, then paste it below
				</div>
				<input
					onChange={e => setPassphrase(e.target.value)}
					placeholder='Passphrase (Ex: brgngzcssh)'
					required
					value={passphrase}
				/>
				<div>
					5. Click <b>Create API Key</b>
				</div>
				<div>6. If necessary, enter your 2-step verification code</div>
				<div>
					7. Click <b>Add API Key</b>
				</div>
				<div>
					8. Copy the <b>API Secret</b>, then paste it below
				</div>
				<input
					onChange={e => setApiSecret(e.target.value)}
					placeholder='API Secret (Ex: 1duAX0r4j8qEg40raTtPGJ+LgWnbspqZ6Gnq1Wq3eHTb6mBYh1cA+JiNmTopuzIDfzga5e4jeIH/c8nCqnZU1g==)'
					required
					value={apiSecret}
				/>
				<div>
					9. Click <b>Done</b>
				</div>
				<div>
					10. Copy the <b>API Key</b>, then paste it below
				</div>
				<input
					onChange={e => setApiKey(e.target.value)}
					placeholder='API Key (Ex: 403b73dc1b819672f669d2ce46ff79ef)'
					required
					value={apiKey}
				/>
				<input className='Continue' type='submit' value='Connect Coinbase Pro' />
			</form>
		</div>
	)
}

export default Sign
