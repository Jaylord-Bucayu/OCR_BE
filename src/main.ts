
import express  from "express";
import cors from 'cors';
import bodyParser from 'body-parser';

import { authRoutes } from "./routes/auth.routes"
import { UsersRoute } from "./routes/user.routes";
import { text2speechRoutes } from './routes/text2speech.routes'
import path from 'path'

import initializeMongoose from './config/mongoose';

const app = express();
const port = 5000;
// Enable CORS
app.use(cors());
app.use(bodyParser.json());


// Set up a route to serve audio files
app.use('/audio', express.static('audio'));

initializeMongoose();
authRoutes(app);
UsersRoute(app);
text2speechRoutes(app);




app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
