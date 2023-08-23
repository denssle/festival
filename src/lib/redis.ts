import Redis from 'ioredis';
import { REDIS_TOKEN } from '$env/static/private';

export default REDIS_TOKEN ? new Redis(REDIS_TOKEN) : new Redis();
