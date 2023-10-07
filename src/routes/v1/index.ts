import express, { Router } from 'express';
import twitterRoute from './twitter.route';
import characterRoute from './character.route';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/twitter',
    route: twitterRoute,
  },
  {
    path: '/character',
    route: characterRoute,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
