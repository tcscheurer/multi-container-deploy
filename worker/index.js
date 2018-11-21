const {
    redisHost,
    redisPort,
} = require('./keys');
const redis = require('redis')

const redisClient = redis.createClient({
    host: redisHost,
    port: redisPort,
    retry_strategy: () => 1000
})

const sub = redisClient.duplicate()

const fib = (index, memo = {}) => {
    if(memo[index]) return memo[index]
    if (index < 2) return 1;

    return memo[index] =  fib(index - 1, memo) + fib(index -2, memo)
}

sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');