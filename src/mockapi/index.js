import express from 'express';
import cors from "cors";
const app = express();
const port = 3001;
app.use(cors());

app.post('/api/v1/auth/jwt/login', (req, res) => {
	console.log(req);
  res.send(JSON.stringify({
		"access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiOTIyMWZmYzktNjQwZi00MzcyLTg2ZDMtY2U2NDJjYmE1NjAzIiwiYXVkIjoiZmFzdGFwaS11c2VyczphdXRoIiwiZXhwIjoxNTcxNTA0MTkzfQ.M10bjOe45I5Ncu_uXvOmVV8QxnL-nZfcH96U90JaocI",
		"token_type": "bearer"
	}));
});

app.listen(port, () => {
  console.log(`Mockapi started at port: ${port}`);
})