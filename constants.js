exports.adalConfiguration = {
  authority: 'https://login.microsoftonline.com/common',
  clientID: '4fcb2201-970e-43ef-8577-82bcb18708fc',
  clientSecret: 'nOjGl8ScJq290ruKzz.-P]TzMrfHKGD=',
  redirectUri: 'http://localhost:3000/callback'
};

exports.subscriptionConfiguration = {
  changeType: 'created',
  notificationUrl: 'https://96fa7c88.ngrok.io/listen',
  resource: 'me/mailFolders(\'Inbox\')/messages',
  clientState: 'cLIENTsTATEfORvALIDATION'
};
