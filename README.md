# Raycast extension for Harvest

You'll need 3 things to run this extension: An `account id`, a `token` and your `user ID`. All of which you can get here: https://id.getharvest.com/developers.

You can get your user ID either by looking at the URL when you're at your profile page in the Harvest app. Should look something like this: `https://<YOUR_APP>.harvestapp.com/people/<USER_ID>/edit`.

Another way: After generating your token, you'll see a section "Testing your token" which will look something like this:
```
curl -i \
  -H 'Harvest-Account-ID: <ACCOUNT_ID>'\
  -H 'Authorization: Bearer <TOKEN>\
  -H 'User-Agent: Harvest API Example' \
  "https://api.harvestapp.com/api/v2/users/me.json"
```
Example only, do not use :D 

Copy, paste and run that command in your terminal. Your User ID (`id` in the response) should be the first item in the object. Add this along with your token and account ID to the extension preferences and you'll be good to go!
