# PRODUCTION DEPLOYMENT TUTORIAL FOR FRONT-END IN HOSTSTINGER 

# PREPARE THE FRONT-END
### Checklist:
- [ ] Must be on the Frontend folder.

- [ ] Node modules are installed

- [ ] Frontend/ has no erros (errors like [declared but never read], [imported but never used] can be disregarded or ignored.).

- [ ] Configure the .env to point or call the base url endpoint correctly

## 1. Locating the Front-end
Note: must be cloned, already and up to date.
```
cd path/to/Frontend
```

## 2. Installing the node modules.
Note: node.js must be installed and other, check other read.me's for the requirements
```
npm install dev
```

## 3. Clear out errors
Note: Fix the errors(errors like [declared but never read], [imported but never used] can be disregarded or ignored. ).

## 4. Point out the correct endpoint!
in your .env and .end.production
```
EXAMPLE_API_URL="https://urloftheapi.com"
```
Don't forget to save your .env and .production!

## 5. Run the command!
```
npm run build
```
after running the command, a dist folder will be created at the root folder of Frontend

# DEPLOYING IN HOSTINGER!
 Visit your hoststinger dashboard!
 
 Locate the websites at the sidebar of hostinger
 
 Click and visit the file manager of your website!

# Go inside the public_html
# DO NOT DELETE THE default.php
If the public_html contains a lot of files similarly inside the dist folder created, delete the files currently inside the public_html folder.

upload your dist folder, after the upload is complete move the files inside the dist folder in public_html.



