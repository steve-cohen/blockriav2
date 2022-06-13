import React from 'react'

const ClientAbout = ({ client }) => {
	return (
		<div className='ResponsiveTable'>
			<table id='about'>
				<caption>
					<div className='Flex'>
						<div className='Title'>About</div>
					</div>
				</caption>
				<thead style={{ whiteSpace: 'nowrap' }}>
					<tr>
						<th>NAME</th>
						<th>EMAIL</th>
						<th>COUNTRY</th>
						<th>STATE</th>
						<th className='Break'>TIME ZONE</th>
						<th>JOINED COINBASE</th>
						<th>JOINED BLOCK RIA</th>
					</tr>
				</thead>
				<tbody>
					{client.clientId ? (
						<tr>
							<td>{client.clientName}</td>
							<td style={{ textTransform: 'lowercase' }}>{client.clientEmail}</td>
							<td style={{ textTransform: 'none' }}>{client.clientMetadata.country.name}</td>
							<td style={{ textTransform: 'none' }}>{client.clientMetadata.state}</td>
							<td>{client.clientMetadata.time_zone}</td>
							<td>{new Date(client.clientMetadata.created_at).toISOString().slice(0, 10)}</td>
							<td>{new Date(client.createdAt).toISOString().slice(0, 10)}</td>
						</tr>
					) : null}
				</tbody>
			</table>
		</div>
	)
}

export default ClientAbout
