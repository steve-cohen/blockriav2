import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './CoinbasePro.css'

const Sign = () => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const advisorId = searchParams.get('advisorId')
	const clientEmail = searchParams.get('clientEmail')

	const [apiKey, setApiKey] = useState('')
	const [apiSecret, setApiSecret] = useState('')
	const [clientName, setClientName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [passphrase, setPassphrase] = useState('')

	async function handleSubmit(e) {
		e.preventDefault()
		setIsLoading(true)

		const coinbaseProOptions = { advisorId, apiKey, apiSecret, clientEmail, clientName, passphrase }
		await fetch('https://blockria.com/api/coinbasepro/authorization', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(coinbaseProOptions)
		})
			.then(() => navigate('/advisor/clientonboarding'))
			.catch(alert)
	}

	return isLoading ? (
		<div className='CoinbasePro NewFormWrapper'>
			<div className='Loading'>Loading...</div>
		</div>
	) : (
		<div className='CoinbasePro NewForm NewFormWrapper'>
			<form onSubmit={handleSubmit}>
				<div className='Title'>Connect Your Coinbase Pro Account</div>
				<div>1. Enter Your Full Legal Name</div>
				<input onChange={e => setClientName(e.target.value)} required value={clientName} />
				<div style={{ margin: '24px 0 24px 2px' }}>
					2.
					<a href='https://pro.coinbase.com/profile/api' target='_blank' rel='noopener noreferrer'>
						<b> Visit Coinbase Pro's API Page</b>
					</a>
				</div>
				<div>
					3. Click <b>+ New API Key</b>
				</div>
				<div>
					4. Under <b>Permissions</b>, select <b>View</b>, <b>Transfer</b>, and <b>Trade</b>
				</div>
				<div>
					5. Copy the <b>Passphrase</b>, then paste it below
				</div>
				<input
					onChange={e => setPassphrase(e.target.value)}
					placeholder='Passphrase (Ex: brgngzcssh)'
					required
					value={passphrase}
				/>
				<div>
					6. Click <b>Create API Key</b>
				</div>
				<div>7. If necessary, enter your 2-step verification code</div>
				<div>
					8. Click <b>Add API Key</b>
				</div>
				<div>
					9. Copy the <b>API Secret</b>, then paste it below
				</div>
				<input
					onChange={e => setApiSecret(e.target.value)}
					placeholder='API Secret (Ex: 1duAX0r4j8qEg40raTtPGJ+LgWnbspqZ6Gnq1Wq3eHTb6mBYh1cA+JiNmTopuzIDfzga5e4jeIH/c8nCqnZU1g==)'
					required
					value={apiSecret}
				/>
				<div>
					10. Click <b>Done</b>
				</div>
				<div>
					11. Copy the <b>API Key</b>, then paste it below
				</div>
				<input
					onChange={e => setApiKey(e.target.value)}
					placeholder='API Key (Ex: 403b73dc1b819672f669d2ce46ff79ef)'
					required
					value={apiKey}
				/>
				<input className='Continue' type='submit' value='Connect Coinbase Pro' />
				<div className='Cancel' onClick={() => navigate(-1)}>
					Cancel
				</div>
			</form>
		</div>
	)
}

export default Sign
