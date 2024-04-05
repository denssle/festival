import { Sequelize } from 'sequelize';
import { MARIA_DB_PASSWORD, MARIA_DB_USER } from '$env/static/private';

export const sequelize: Sequelize = new Sequelize({
	dialect: 'mariadb',
	host: 'localhost',
	username: MARIA_DB_USER,
	password: MARIA_DB_PASSWORD,
	database: MARIA_DB_USER,
	define: {}
});
