import { Sequelize } from 'sequelize';
import { MARIA_DB_USER, MARIA_DB_PASSWORD } from '$env/static/private';

const sequelize: Sequelize = new Sequelize({
	dialect: 'mariadb',
	host: 'localhost',
	username: MARIA_DB_USER,
	password: MARIA_DB_PASSWORD,
	database: MARIA_DB_USER
});

export async function testConnection() {
	const results = await sequelize.query('SELECT * FROM festival_event;');
	console.log(results);
}
