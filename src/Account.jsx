import React, { createContext } from 'react'
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'
import Pool from './UserPool'

const AccountContext = createContext()

const Account = props => {
	const getAdvisorId = () => {
		return Pool.getCurrentUser().username
	}

	const authenticate = async (Username, Password) => {
		return await new Promise((resolve, reject) => {
			const user = new CognitoUser({ Username, Pool })
			const authenticationDetails = new AuthenticationDetails({ Username, Password })

			user.authenticateUser(authenticationDetails, {
				onSuccess: data => {
					console.log('onSuccess: ', data)
					resolve(data)
				},
				onFailure: ({ message }) => {
					console.log('onFailure: ', message)
					reject(message)
				},
				newPasswordRequired: data => {
					console.log('newPasswordRequired: ', data)
					resolve(data)
				}
			})
		})
	}

	const getCurrentUser = () => {
		return Pool.getCurrentUser()
	}

	const isSignedIn = () => {
		const user = Pool.getCurrentUser()
		if (user) return true
		else return false
	}

	const getSession = async () => {
		return await new Promise((resolve, reject) => {
			const user = Pool.getCurrentUser()
			console.log(user)

			if (user) {
				user.getSession(async (error, session) => {
					if (error) {
						reject()
					} else {
						const attributes = await new Promise((resolve, reject) => {
							user.getUserAttributes((error, attributes) => {
								if (error) {
									reject(error)
								} else {
									const results = {}
									for (let attribute of attributes) {
										const { Name, Value } = attribute
										results[Name] = Value
									}

									resolve(results)
								}
							})
						})
						resolve({ user, ...session, ...attributes })
					}
				})
			} else {
				reject()
			}
		})
	}

	const signOut = async () => {
		console.log('Sign Out')
		const user = Pool.getCurrentUser()
		if (user) await user.signOut()
	}

	return (
		<AccountContext.Provider value={{ authenticate, getAdvisorId, getCurrentUser, getSession, isSignedIn, signOut }}>
			{props.children}
		</AccountContext.Provider>
	)
}

export { Account, AccountContext }
