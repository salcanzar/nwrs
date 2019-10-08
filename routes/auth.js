import express from 'express';

import { getSubscription, saveSubscription, deleteSubscription } from '../helpers/dbHelper';
import { getAuthUrl, getTokenFromCode } from '../helpers/authHelper';
import { postData, deleteData } from '../helpers/requestHelper';
import { subscriptionConfiguration } from '../constants';

export const authRouter = express.Router();

// Redirect to start page
authRouter.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Start authentication flow
authRouter.get('/signin', (req, res) => {
  res.redirect(getAuthUrl());
});

// This route gets called at the end of the authentication flow.
// It requests the subscription from Office 365, stores the subscription in a database,
// and redirects the browser to the home page.
authRouter.get('/callback', (req, res, next) => {
  getTokenFromCode(req.query.code, (authenticationError, token) => {
    if (token) {
      // Request this subscription to expire one day from now.
      // Note: 1 day = 86400000 milliseconds
      subscriptionConfiguration.expirationDateTime = new Date(Date.now() + 86400000).toISOString();

      // Make the request to subscription service.
      postData(
        '/v1.0/subscriptions',
        token.accessToken,
        JSON.stringify(subscriptionConfiguration),
        (requestError, subscriptionData) => {
          if (subscriptionData) {
            subscriptionData.userId = token.userId;
            subscriptionData.accessToken = token.accessToken;
            saveSubscription(subscriptionData, null);

            // The name of the property coming from the service might change from
            // subscriptionId to id in the near future.
            res.redirect(
              '/home.html?subscriptionId=' + subscriptionData.id +
              '&userId=' + subscriptionData.userId
            );
          } else if (requestError) {
            console.log('Request failed')
            res.status(500);
            next(requestError);
          }
        }
      );
    } else if (authenticationError) {
      console.log('Auth failed')

      res.status(500);
      next(authenticationError);
    }
  });
});

// This route signs out the users by performing these tasks
// Delete the subscription data from the database
// Redirect the browser to the logout endpoint.
authRouter.get('/signout/:subscriptionId', (req, res) => {
  const redirectUri = `${req.protocol}://${req.hostname}:${req.app.settings.port}`;

  // Delete the subscription from Microsoft Graph
  getSubscription(req.params.subscriptionId, (dbError, subscriptionData, next) => {
    if (subscriptionData) {
      deleteData(
        `/beta/subscriptions/${req.params.subscriptionId}`,
        subscriptionData.accessToken,
        error => {
          if (!error) deleteSubscription(req.params.subscriptionId, null);
        }
      );
    } else if (dbError) {
      res.status(500);
      next(dbError);
    }
  });

  res.redirect('https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=' + redirectUri);
});
