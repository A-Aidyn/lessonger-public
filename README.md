# lessonger

## How to run the project?

@A-Aidyn  
@arr10  
@tdiyar  
@AsselK1  
@nargizas  
@IamNoPro  
@NurlykhanKairly  
@abirakhman  


## How to run the project?

### BACKEND:
1. Create your own virtual environment in lessonger/backend/venv folder and enable it in your terminal/ide (make sure your pip is up to date).  
Linux/Mac
```
python3 -m venv venv
source venv/bin/activate
```
Windows
```
python3 -m venv venv
venv\Scripts\activate.bat
```

2. Open backend directory with your console. Install needed modules:
```
pip install -r requirements.txt
```
~~3. Install redis and run it on port 6379. Refer [here](https://channels.readthedocs.io/en/stable/tutorial/part_2.html)  
For linux/mac users we can use docker with this command (may need to install docker first)~~
```
$ docker run -p 6379:6379 -d redis:5
```
3. Run celery
```
$ celery -A lessonger worker --loglevel=INFO
```
5. Finally, run the backend in src folder
```
python manage.py runserver
```
PS: you may need to migrate django models if backend doesn't work
```
python manage.py makemigrations
python manage.py migrate
```

### FRONTEND:
1. Install node.js, npm and other things (If things don't work just follow the steps in this [video](https://www.youtube.com/watch?v=Wv5jlmJs2sU&list=PLLRM7ROnmA9EnQmnfTgUzCfzbbnc-oEbZ&index=1)). Open frontend directory with console and type:
```
npm install
npm install -g parcel-bundler  
npm install --save-dev @babel/preset-react  
```
2. run 
```
npm start
```
3. [Message to frontenders :)] For debugging purposes you have to install react redux, react chrome extensions. Refer [here](https://redux.js.org/tutorials/essentials/part-1-overview-concepts). In that website there are also good sources of information about react, redux and other things. So, consider reading them carefully.

4. [Extra] less-watch-compiler  
You can use [Less](http://lesscss.org/) tool instead of writing native CSS. Less supports nesting, variable creation etc. [Tutorial](https://www.youtube.com/watch?v=YD91G8DdUsw)
In order to use Less: first install less and compiler
```
npm install -g less
npm install -g less-watch-compiler
```
Then, run
```
less-watch-compiler
```
This will automatically compile all the changes in .less files into .css as long as terminal is open

#### How to run the application?  
Go to this [link](http://localhost:1234)  

## Installing PostgreSQL  
1. Install PostgreSQL client  

https://www.ibm.com/cloud/blog/postgresql-tips-installing-the-postgresql-client  

2. Install pyscorpg2 module in your virtual environment.  
```
pip install psycopg2
```  

3. Pull changes from repo.  
```
git pull
```  

## Configuring Git SSH
Configuring this allows you to immediately push/pull from git repo (without typing your password each time)  

https://cdn-uploads.piazza.com/paste/izzgldkcy7s164/e5187df8c36a920806edac367c6793c186672b381273479b6490a88b5b553964/Git_Configuration.pdf

## Useful links  
### BACKEND: 
Tech stack: Django, sqlite database, DRF (django rest framework), DRA (django rest auth), django all auth, ...  

https://docs.djangoproject.com/en/3.1/topics/  
https://docs.djangoproject.com/en/3.1/genindex/  
https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Introduction  
https://www.django-rest-framework.org/#:~:text=Django%20REST%20framework%20is%20a,packages%20for%20OAuth1a%20and%20OAuth2.  
https://django-rest-auth.readthedocs.io/en/latest/installation.html  
https://django-rest-auth.readthedocs.io/en/latest/installation.html  
https://pypi.org/project/django-cors-headers/#:~:text=django%2Dcors%2Dheaders%20is%20a,Origin%20Resource%20Sharing%20(CORS).  
https://django-rest-auth.readthedocs.io/en/latest/demo.html  
https://django-allauth.readthedocs.io/en/latest/installation.html  
https://www.django-rest-framework.org/api-guide/relations/#serializer-relations  
https://learn-anything.xyz/web-development/full-stack/django  

### FRONTEND:  
Tech stack: React, React-redux, AJAX (axios), node.js, npm, ...  

https://ant.design/  (VPN needed)  
https://parceljs.org/  
https://babeljs.io/  
https://reactjs.org/docs/hello-world.html  
https://redux.js.org/tutorials/essentials/part-1-overview-concepts  
https://javascript.info/  
https://javascript.info/promise-basics  
https://javascript.info/fetch  
https://javascript.info/fetch#sending-an-image  
https://daveceddia.com/archives/  
https://learn-anything.xyz/web-development/javascript-libraries/react  

## General things to learn  
git, github  (also git workflow)   
HTTP  
RESTful api  
Concurrent programming  
OOP  
JSON (reading, parsing, sending)  
etc..  


## How to pull changes from other branch (master) to your currently working branch
- go to the master branch BRANCH_NAME

`git checkout BRANCH_NAME`
- pull all the new changes from BRANCH_NAME branch

`git pull`
- go to your branch YOUR_CUR_BRANCH_NAME

`git checkout YOUR_CUR_BRANCH_NAME`
- merge the changes of BRANCH_NAME branch into YOUR_CUR_BRANCH_NAME branch

`git merge BRANCH_NAME`
or 
`git cherry-pick {commit-hash} if you want to merge specific commits`
- push your changes with the changes of BRANCH_NAME branch

`git push`

_Note: probably you will have to fix conflicts after merging our-team branch into featurex branch before pushing_

## Logging

```
import logging

logger = logging.getLogger(__name__)

...

# Usage in code (formatted strings)
logger.debug(f"type of state: {type(state)}, state is: {state}")

```

Track files 
```
tail -f debug.log
tail -f djangonativedebug.log  # In other terminal
```

## Credits to:   

[JustDjango](https://www.youtube.com/channel/UCRM1gWNTDx0SHIqUJygD-kQ) YouTube Channel  

https://github.com/justdjango/justchat  Django Channels Repo  
