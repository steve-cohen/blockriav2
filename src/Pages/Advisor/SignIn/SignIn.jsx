import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AccountContext } from '../../../Account'
import { demoAdvisorEmpty } from '../demoData'
import './SignIn.css'

const SignIn = ({ setAdvisor, setClients, setPortfolios }) => {
	const { authenticate } = useContext(AccountContext)
	const navigate = useNavigate()

	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [password, setPassword] = useState('')

	useEffect(() => {
		localStorage.clear()
		setAdvisor(demoAdvisorEmpty)
	}, [])

	function getAdvisorClients(newAdvisor) {
		return fetch(`https://blockria.com/advisor/clients?advisorId=${newAdvisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newClients => {
				console.log(newClients)
				setClients(newClients)
			})
			.catch(error => alert(error))
	}

	function getAdvisorPortfolios(newAdvisor) {
		return fetch(`https://blockria.com/portfolios/query?advisorId=${newAdvisor.idToken.payload.sub}`)
			.then(response => response.json())
			.then(newPortfolios => {
				console.log(newPortfolios)
				setPortfolios(newPortfolios)
			})
			.catch(error => alert(error))
	}

	function handleSubmit(e) {
		e.preventDefault()
		setIsLoading(true)

		if (!e.currentTarget.checkValidity()) {
			e.stopPropagation()
			setIsLoading(false)
			return
		}

		authenticate(email, password)
			.then(async newAdvisor => {
				setAdvisor(newAdvisor)
				localStorage.setItem('advisor', JSON.stringify(newAdvisor))

				await Promise.all([getAdvisorClients(newAdvisor), getAdvisorPortfolios(newAdvisor)])

				setIsLoading(false)
				navigate('/advisor')
			})
			.catch(({ message }) => {
				setIsLoading(false)
				alert(message)
			})
	}

	return (
		<div className='SignIn'>
			<div className='Description'>
				<div className='Title'>Sign into your Account.</div>
			</div>
			<form onSubmit={handleSubmit}>
				<input
					autoFocus
					minLength={1}
					onChange={e => setEmail(e.target.value)}
					placeholder='EMAIL'
					required
					type='email'
					value={email}
				/>
				<input
					minLength={6}
					onChange={e => setPassword(e.target.value)}
					placeholder='PASSWORD'
					required
					type='password'
				/>
				<button disabled={isLoading} type='submit'>
					{isLoading ? 'Loading…' : 'Sign In'}
				</button>
				<Link to='/advisor/signup'>Need an account? Sign Up</Link>
			</form>
		</div>
	)
}

export default SignIn
