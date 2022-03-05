import React, { useContext, useEffect, useState } from 'react'
import { AccountContext } from '../../../Account'
import './Invites.css'

const Invites = () => {
	const { getCurrentUser } = useContext(AccountContext)
	const [coinbaseInviteUrl, setCoinbaseInviteUrl] = useState('')
	const [isCopied, setIsCopied] = useState(false)

	useEffect(() => {
		let newCoinbaseInviteUrl = `https://www.coinbase.com/oauth/authorize?account=all&scope=wallet:accounts:read,wallet:accounts:update,wallet:accounts:create,wallet:accounts:delete,wallet:addresses:read,wallet:addresses:create,wallet:buys:read,wallet:buys:create,wallet:deposits:read,wallet:deposits:create,wallet:notifications:read,wallet:payment-methods:read,wallet:payment-methods:delete,wallet:payment-methods:limits,wallet:sells:read,wallet:sells:create,wallet:transactions:read,wallet:transactions:request,wallet:transactions:transfer,wallet:user:read,wallet:user:update,wallet:user:email,wallet:withdrawals:read,wallet:withdrawals:create,wallet:transactions:send&meta[send_limit_amount]=1&meta[send_limit_currency]=USD&meta[send_limit_period]=day&response_type=code&client_id=d41fd296f21919731b07190afcf278b4f7a7f2813d029bb48d81fbf872c8fae4`
		// newCoinbaseInviteUrl += `&state=${getCurrentUser().username}`
		setCoinbaseInviteUrl(newCoinbaseInviteUrl)
	}, [])

	function handleClick() {
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(coinbaseInviteUrl)
			setIsCopied(true)
		}
	}

	return (
		<div className='Invites'>
			<div className='Title'>Invites</div>
			<div className='Custodian'>Coinbase</div>
			<div className='Flex'>
				<div className='Copy' onClick={handleClick}>
					{isCopied ? 'Copied' : 'Copy Link'}
				</div>
				<div className='Url'>{coinbaseInviteUrl}</div>
			</div>
		</div>
	)
}

export default Invites
