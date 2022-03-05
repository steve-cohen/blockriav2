import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
	return (
		<div className='Home'>
			<div className='Menu'>
				<div>
					<Link className='Logo' to='/'>
						B
					</Link>
					<div className='Name'>Block RIA</div>
				</div>
				<div>
					<Link className='ToSignIn' to='/signin'>
						Sign In
					</Link>
					<Link className='ToSignUp' to='/signup'>
						Get Started
					</Link>
				</div>
			</div>
			<div className='Hero'>
				<div className='Description'>
					<div className='Title'>Model Portfolios for Modern Management</div>
					<div>Curated Digital Asset Portfolio Management</div>
					<div className='SubTitle'>Built for Advisors by Advisors</div>
				</div>
				<div className='Features'>
					<div>✓ Instantly manage digital assets on behalf of clients</div>
					<div>✓ Easily create and assign model portfolios</div>
					<div>✓ Automatically rebalance and adjust portfolios</div>
					<div>✓ Individually customize billing plans</div>
					<div>✓ Quickly generate tax and performance reports</div>
					<Link className='ToSignUp' to='/signup'>
						Get Started
					</Link>
					<Link className='ToSignIn' to='/signin'>
						Sign In
					</Link>
				</div>
			</div>
		</div>
	)
}

export default Home
