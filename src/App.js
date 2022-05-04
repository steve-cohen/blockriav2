import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Account } from './Account'

import Advisor from './Pages/Advisor/Advisor'
import Home from './Pages/Home/Home'
import Sign from './Pages/Client/Sign/Sign'

import './App.css'

function App() {
	return (
		<Account className='App'>
			<Routes>
				<Route path='/advisor/*' element={<Advisor />} />
				<Route path='/client/sign' element={<Sign />} />
				<Route path='*' element={<Home />} />
			</Routes>
		</Account>
	)
}

export default App
