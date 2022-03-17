import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js'
import './VerifyEmail.css'

const VerifyEmail = () => {
	const { state } = useLocation()
	const { email } = state

	const [isLoading, setIsLoading] = useState(false)
	const [didResend, setDidResend] = useState(false)

	async function resendConfirmation() {
		setDidResend(true)
		setIsLoading(true)

		const newPool = new CognitoUserPool({ UserPoolId: 'us-west-1_cq7TRYjgb', ClientId: '6ovesvi8q12oaap68euvqem85l' })
		const newUser = new CognitoUser({ Username: email, Pool: newPool })
		newUser.resendConfirmationCode((error, response) => {
			if (error) alert(error.message || JSON.stringify(error))
			else {
				console.log(response)
				setDidResend(true)
			}
		})

		setIsLoading(false)
	}

	return (
		<div className='VerifyEmail'>
			<div className='Title'>Please Verify Your Email.</div>
			<div className='Form'>
				<div className='Email'>{email}</div>
				<button disabled={isLoading} onClick={() => resendConfirmation()}>
					{isLoading ? 'Loading' : didResend ? 'Sent' : 'Resend Verification Email'}
				</button>
			</div>
		</div>
	)
}

export default VerifyEmail
