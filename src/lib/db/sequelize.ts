import { type Options, Sequelize } from 'sequelize';
import { env } from '$env/dynamic/private';
const { MARIA_DB_NAME, MARIA_DB_PASSWORD, MARIA_DB_USER } = env;

const isTestOrLocal =
	MARIA_DB_NAME == 'dev' ||
	process.env.NODE_ENV === 'test' ||
	process.env.VITEST === 'true' ||
	process.env.PLAYWRIGHT === 'true';

const options: Options = isTestOrLocal
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
