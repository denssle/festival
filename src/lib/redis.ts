import Redis from 'ioredis';
import { REDIS_TOKEN } from '$env/static/private';

console.log('REDIS_TOKEN: ', REDIS_TOKEN);
export default REDIS_TOKEN ? new Redis(REDIS_TOKEN) : new Redis();
