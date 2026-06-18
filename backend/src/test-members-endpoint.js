const jwt = require('jsonwebtoken');
const axios = require('axios');
const config = require('./config');

const token = jwt.sign(
  {
    id: 'test_admin_id',
    username: 'test_admin',
    isAdmin: true
  },
  config.jwtSecret,
  { expiresIn: '1h' }
);

console.log(`Generated JWT Admin Token: ${token}`);

axios.get('http://localhost:1679/api/admin/guilds/1425815536939302924/members', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.then(res => {
  console.log(`SUCCESS! Status: ${res.status}`);
  console.log(`Fetched ${res.data.length} members.`);
  console.log(`First member:`, res.data[0]);
})
.catch(err => {
  console.error(`FAILED!`);
  if (err.response) {
    console.error(`Status: ${err.response.status}`);
    console.error(`Data:`, err.response.data);
  } else {
    console.error(err.message);
  }
});
