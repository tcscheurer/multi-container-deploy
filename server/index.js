const {
    redisHost,
    redisPort,
    pgUser,
    pgHost,
    pgDatabase,
    pgPassword,
    pgPort,
} = require('./keys');

const express = require('express')
const {json} = require('body-parser')
const cors = require('cors')

const app = express();
app.use(cors())
app.use(json())

const { Pool } = require('pg')

const pgClient = new Pool({
    user: pgUser,
    host: pgHost,
    database: pgDatabase,
    password: pgPassword,
    port: pgPort,
})
pgClient.on('error', () => console.log('Lost PG connection'))

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
.catch(err => console.log(err))

const redis = require('redis')

const redisClient = redis.createClient({
    host: redisHost,
    port: redisPort,
    retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();


app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
});

app.get('/values/current', (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values)
    })
});

app.post('/values', async(req, res) => {
    const {index} = req.body;
    console.log(`Receiving index: ${index}`)
    if (parseInt(index) > 40){
        return res.status(422).send('Index too high')
    } 

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index, () => {});
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({
        working: true
    })
});

app.listen(5000, () => console.log('Listening on 5000'))