const express = require("express")
//const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require('dotenv');
const {connectDB} = require('./database/db.js');
const userRoutes = require('./routes/userRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const songRoutes = require('./routes/songRoutes');
dotenv.config();

const port = process.env.PORT;
//database connection
connectDB();

const app = express()

// const corsOption={
//     origin:"https://mernmovie.netlify.app",
//     credentials: true
// }
//cros connection
app.use(cors());
app.use(cookieParser());
app.use(express.json());

//routes connection
app.use('/api/user',userRoutes);
app.use('/api/song/',songRoutes);
app.use(notFound);
app.use(errorHandler);
app.listen(port,()=>{
    console.log(`app is running ${port}`);
})