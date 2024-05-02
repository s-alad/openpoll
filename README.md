# openpoll
## https://openpoll.vercel.app
### Openpoll is a free, open-source, live polling app that can be used to interact with groups of people in a recurring manner. 

---

### how to run an instance of openpoll
1. create a firebase project
    - add a web app to the project
    - copy the proper firebase credentials into the .env file based on .env.example into the app/op-next directory
2. add the firebase realtime database
3. add the firebase firestore database
4. add the firebase authentication service
    - enable google authentication
    - navigate to authentication settings and authorize any domains that will be used to access the app 
5. add firebase functions
    - update /functions/.firebasesrc to point to your firebase project
6. deploy the app to a hosting service
    - ensure the hosting service is authorized in the firebase authentication settings
    - ensure the hosting service has the required environment variables set

### how to locally develop openpoll
1. ensure you have the following installed:  
    -  node.js  
    -  npm / yarn / {package manager of choice}
    - firebase cli
2. clone the repository
3. follow any steps in *running an instance of openpoll* to set up the firebase project
4. `/openpoll $ yarn install`
5. `/openpoll $ yarn dev`

--- 
### openpoll directory structure
- /app
    - /op-expo
    - /op-next
        - /components
        - /context
        - /forms
        - /layout
        - /pages
        - /public
        - /redirect
        - /styles
        - /ui
        .env
- /firebase
    - /functions
        - /src
        - /lib
- /packages
    - /models
    - /utils
    - /config
    - /validation
---
