import express, { Router } from 'express';
import twitterRoute from './twitter.route';
import characterRoute from './character.route';
import authRoute from './auth.route';
import userRoute from './user.route';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/tweets',
    route: twitterRoute,
  },
  {
    path: '/characters',
    route: characterRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
