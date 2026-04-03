import { Sequelize, type Options } from 'sequelize';
import { MARIA_DB_NAME, MARIA_DB_PASSWORD, MARIA_DB_USER } from '$env/static/private';
import { dev } from '$app/environment';

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true' || process.env.PLAYWRIGHT === 'true';
const useSqlite = isTest || dev;

const options: Options = useSqlite
	? {
			dialect: 'sqlite',
			storage: ':memory:',
			logging: false
		}
	: {
			dialect: 'mariadb',
			host: 'localhost',
			username: MARIA_DB_USER,
			password: MARIA_DB_PASSWORD,
			database: MARIA_DB_USER + '_' + MARIA_DB_NAME,
			define: {}
		};

export const sequelize: Sequelize = new Sequelize(options);
