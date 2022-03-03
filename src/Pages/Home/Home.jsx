import React from 'react'
// import Image1 from './Black logo - no background.png'
import './Home.css'

const Home = () => {
	return (
		<div className='Home'>
			<div className='Menu'>
				{/* <img src={require('./Black logo - no background.png')} /> */}
				<a href='#about'>About</a>
				<a href='#pricing'>Pricing</a>
				<a href='#contact'>Contact</a>
			</div>
			<div className='Hero'>
				<div className='Line1' />
				<div className='Line2' />
				<div className='Title'>Model Portfolios for Modern Management</div>
				<div className='SubTitle'> Curated Digital Asset Portfolio Management | For Advisors by Advisors</div>
			</div>
			<a className='ToSignUp' href='/signup'>
				Get Started
			</a>
			<a className='ToSignIn' href='/signin'>
				Sign In
			</a>
		</div>
	)
}

export default Home
