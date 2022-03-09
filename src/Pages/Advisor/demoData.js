export const demoAdvisor = {
	idToken: {
		payload: {
			'custom:firm_name': 'Cohen Capital',
			family_name: 'Cohen',
			given_name: 'Steve',
			sub: 'aukn3kq-asda3-asdsa3-asdaw-asdweasd'
		}
	}
}

export const demoClients = [
	{
		clientId: { S: 'io8jhwaoidsfd32r' },
		clientMetadata: {
			S: `{"id":"5d38952d-fbdc-53c8-9930-faa2aec18995","name":"Steve Cohen","username":null,"profile_location":null,"profile_bio":null,"profile_url":null,"avatar_url":"https://images.coinbase.com/avatar?h=6177b855270f6b009bd97wwt3qb2YPgpOCN4%2FWq6GFDcpqiL54u1CF%2FXYG0%2F%0ANj9N&s=128","resource":"user","resource_path":"/v2/user","email":"scohen1995@gmail.com","legacy_id":"6177b855270f6b009bd970a1","time_zone":"Pacific Time (US & Canada)","native_currency":"USD","bitcoin_unit":"BTC","state":"CA","country":{"code":"US","name":"United States of America","is_in_europe":false},"nationality":{"code":"US","name":"United States of America"},"region_supports_fiat_transfers":true,"region_supports_crypto_to_crypto_transfers":true,"created_at":"2021-10-26T08:12:05Z","supports_rewards":true,"tiers":{"completed_description":"Level 3","upgrade_button_text":null,"header":null,"body":null},"referral_money":{"amount":"10.00","currency":"USD","currency_symbol":"$","referral_threshold":"100.00"},"second_factor":{"method":"sms","totp":{"digits":6},"sms":{"digits":7},"authy":{"minDigits":6,"maxDigits":8},"u2f":{}},"has_blocking_buy_restrictions":false,"has_made_a_purchase":true,"has_buy_deposit_payment_methods":true,"has_unverified_buy_deposit_payment_methods":false,"needs_kyc_remediation":false,"show_instant_ach_ux":false,"user_type":"individual"}`
		},
		clientName: { S: 'Steve Cohen' },
		nonzeroAccounts: {
			S: `[{"id":"2fec3a62-52fa-5aaa-9a6f-b4f29e0b9d90","name":"Cash (USD)","primary":false,"type":"fiat","currency":"USD","balance":{"amount":"2.00","currency":"USD"},"created_at":"2021-10-26T08:14:57Z","updated_at":"2022-02-17T07:51:36Z","resource":"account","resource_path":"/v2/accounts/2fec3a62-52fa-5aaa-9a6f-b4f29e0b9d90","allow_deposits":true,"allow_withdrawals":true,"native_balance":{"amount":"2.00","currency":"USD"}},{"id":"2f839f04-c867-59c7-a4dc-98831ccd1430","name":"BTC Wallet","primary":true,"type":"wallet","currency":"BTC","balance":{"amount":"0.00000036","currency":"BTC"},"created_at":"2021-10-26T08:12:06Z","updated_at":"2022-02-17T07:51:35Z","resource":"account","resource_path":"/v2/accounts/2f839f04-c867-59c7-a4dc-98831ccd1430","allow_deposits":true,"allow_withdrawals":true,"native_balance":{"amount":"0.01","currency":"USD"}}]`
		},
		paymentMethods: {
			S: `[{"id":"20dc79dc-3d72-5cf8-9894-c19bffe57328","type":"fiat_account","name":"Cash (USD)","currency":"USD","primary_buy":false,"primary_sell":true,"instant_buy":true,"instant_sell":true,"created_at":"2021-10-26T08:14:57Z","updated_at":"2021-10-26T08:14:57Z","resource":"payment_method","resource_path":"/v2/payment-methods/20dc79dc-3d72-5cf8-9894-c19bffe57328","limits":{"type":"fiat_account","name":"Coinbase Account"},"allow_buy":true,"allow_sell":true,"allow_deposit":false,"allow_withdraw":false,"fiat_account":{"id":"2fec3a62-52fa-5aaa-9a6f-b4f29e0b9d90","resource":"account","resource_path":"/v2/accounts/2fec3a62-52fa-5aaa-9a6f-b4f29e0b9d90"},"verified":true,"minimum_purchase_amount":{"amount":"1.00","currency":"USD"}},{"id":"e4227a07-1daf-595c-8547-dc9819e17e27","type":"ach_bank_account","name":"BANK OF AMERICA, N.A. ********4017","currency":"USD","primary_buy":true,"primary_sell":false,"instant_buy":true,"instant_sell":false,"created_at":"2022-02-16T00:29:05Z","updated_at":"2022-02-16T00:29:06Z","resource":"payment_method","resource_path":"/v2/payment-methods/e4227a07-1daf-595c-8547-dc9819e17e27","limits":{"type":"bank","name":"Bank Account","buy":[{"period_in_days":1,"total":{"amount":"35000.00","currency":"USD"},"remaining":{"amount":"35000.00","currency":"USD"},"description":"$35,000 of your $35,000 daily bank limit remaining","label":"Daily bank limit","next_requirement":null}],"deposit":[{"period_in_days":1,"total":{"amount":"35000.00","currency":"USD"},"remaining":{"amount":"35000.00","currency":"USD"},"description":"$35,000 of your $35,000 daily bank limit remaining","label":"Daily bank limit"}]},"allow_buy":true,"allow_sell":false,"allow_deposit":true,"allow_withdraw":true,"verified":true,"minimum_purchase_amount":{"amount":"1.00","currency":"USD"}},{"allow_deposit": true, "limits": { "deposit": [{ "description": "$35,000 of your $35,000 daily bank limit remaining" }] }, "id": "TEST", "name": "WELLS FARGO *******2983"}]`
		},
		portfolioId: { S: '' }
	},
	{
		clientId: { S: 'asd83297y4ajksd' },
		clientName: { S: 'Arynton Hardy' },
		nonzeroAccounts: { S: '[{"native_balance":{"amount":27382.17,"currency":"USD"}}]' },
		portfolioId: { S: '1645518066986' }
	},
	{
		clientId: { S: 'asdaswq23wed' },
		clientName: { S: 'Madelaine Diaz' },
		nonzeroAccounts: { S: '[{"native_balance":{"amount":14082.98,"currency":"USD"}}]' },
		portfolioId: { S: '1645518264828' }
	}
]

export const demoPortfolios = [
	{
		portfolioId: {
			S: '1645518066986'
		},
		portfolioName: {
			S: 'Classic'
		},
		allocations: {
			S: '[{"holding":"BTC","percent":60},{"holding":"ETH","percent":40}]'
		}
	},
	{
		portfolioId: {
			S: '1645518264828'
		},
		portfolioName: {
			S: 'Equal'
		},
		allocations: {
			S: '[{"holding":"BTC","percent":50},{"holding":"ETH","percent":50}]'
		}
	},
	{
		portfolioId: {
			S: '2645518264828'
		},
		portfolioName: {
			S: 'Bitcoin'
		},
		allocations: {
			S: '[{"holding":"BTC","percent":100}]'
		}
	}
]
