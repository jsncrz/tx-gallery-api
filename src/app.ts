import express, { Express } from 'express';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import httpStatus from 'http-status';
import passport from 'passport';
import { ApiError, errorConverter, errorHandler } from './modules/errors';
import routes from './routes/v1';
import SyncJob from './modules/scheduled';
import { jwtStrategy } from './modules/auth';
import config from './config/config';

const app: Express = express();

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(cors());
app.options('*', cors());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(ExpressMongoSanitize());

// gzip compression
app.use(compression());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// v1 api routes
app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

if (config.env === 'production') {
  SyncJob.syncAllCharactersTweets();
  SyncJob.resyncTweets();
}

export default app;
