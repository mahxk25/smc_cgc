import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SMC Career Connect server running on port ${PORT}`);
});
