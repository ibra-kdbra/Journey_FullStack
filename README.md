# [Soft UI Dashboard Flask](httphs)

## ✅ Start in `Docker`

> 👉 - Start the APP in `Docker`

```bash
docker-compose up --build 
```

Visit `http://localhost:5085` in your browser. The app should be up & running.

<br />

## ✅ Create `.env` file

The meaning of each variable can be found below:

- `DEBUG`: if `True` the app runs in development mode
  - For production value `False` should be used
- `ASSETS_ROOT`: used in assets management
  - default value: `/static/assets`
- `OAuth` via Github
  - `GITHUB_ID`=<GITHUB_ID_HERE>
  - `GITHUB_SECRET`=<GITHUB_SECRET_HERE>


### 👉 Set Up for `Unix`, `MacOS`

> Install modules via `VENV`  

```bash
virtualenv env
source env/bin/activate
pip3 install -r requirements.txt
```

<br />

> Set Up Flask Environment

```bash
export FLASK_APP=run.py
export FLASK_ENV=development
```

<br />

> Start the app

```bash
$ flask run
// OR
$ flask run --cert=adhoc # For HTTPS server
```

At this point, the app runs at `http://127.0.0.1:5000/`.

<br />

### 👉 Set Up for `Windows`

> Install modules via `VENV` (windows)

```
virtualenv env
.\env\Scripts\activate
pip3 install -r requirements.txt
```

<br />

> Set Up Flask Environment

```bash
$ # CMD 
$ set FLASK_APP=run.py
$ set FLASK_ENV=development
$
$ # Powershell
$ $env:FLASK_APP = ".\run.py"
$ $env:FLASK_ENV = "development"
```

<br />

> Start the app

```bash
$ flask run
// OR
$ flask run --cert=adhoc # For HTTPS server
```

At this point, the app runs at `http://127.0.0.1:5000/`.

<br />

## ✅ API Generator

This module helps to generate secure APIs using `Flask-restX` via a simple workflow:

- Edit/add your model in `apps/models.py`
- Migrate the database:

```bash
flask db init     # This should be executed only once
flask db migrate  # Generates the SQL 
flask db upgrade  # Apply changes 
```

- Update Configuration:
  - `apps/config .py`, section `API_GENERATOR`
- Generate the API code:
  - `$ flask gen_api`        # the new code is saved in `apps/api`
- Access the API in the browser:
  - `/api/MODEL_NAME/`

The API is secured using the JWT tocken provided by `/login/jwt/` request (username & password should be provided).  

- GET requests are public (GET all, get Item)
- Mutating requests are protected by token generated based on the user credentials (`username`, `pass`).

> Two POSTMAN Collections are provided in the `media` directory:

- [Books API](./media/api-books.postman_collection) - that uses PORT **5000* for the api
- [Books API 2](./media/api-books-docker.postman_collection) - that uses PORT **5085* for the api (default port in Docker)

In case both ports are unusable in your environment, feel free to edit the files before POSTMAN import.

<br />

### 👉 Create Users

By default, the app redirects guest users to authenticate. In order to access the private pages, follow this set up:

- Start the app via `flask run`
- Access the `registration` page and create a new user:
  - `http://127.0.0.1:5000/register`
- Access the `sign in` page and authenticate
  - `http://127.0.0.1:5000/login`

<br />

## ✅ Codebase

The project is coded using blueprints, app factory pattern, dual configuration profile (development and production) and an intuitive structure presented bellow:

```bash
< PROJECT ROOT >
   |
   |-- apps/
   |    |
   |    |-- home/                           # A simple app that serve HTML files
   |    |    |-- routes.py                  # Define app routes
   |    |
   |    |-- authentication/                 # Handles auth routes (login and register)
   |    |    |-- routes.py                  # Define authentication routes  
   |    |    |-- models.py                  # Defines models  
   |    |    |-- forms.py                   # Define auth forms (login and register) 
   |    |
   |    |-- static/
   |    |    |-- <css, JS, images>          # CSS files, Javascripts files
   |    |
   |    |-- templates/                      # Templates used to render pages
   |    |    |-- includes/                  # HTML chunks and components
   |    |    |    |-- navigation.html       # Top menu component
   |    |    |    |-- sidebar.html          # Sidebar component
   |    |    |    |-- footer.html           # App Footer
   |    |    |    |-- scripts.html          # Scripts common to all pages
   |    |    |
   |    |    |-- layouts/                   # Master pages
   |    |    |    |-- base-fullscreen.html  # Used by Authentication pages
   |    |    |    |-- base.html             # Used by common pages
   |    |    |
   |    |    |-- accounts/                  # Authentication pages
   |    |    |    |-- login.html            # Login page
   |    |    |    |-- register.html         # Register page
   |    |    |
   |    |    |-- home/                      # UI Kit Pages
   |    |         |-- index.html            # Index page
   |    |         |-- 404-page.html         # 404 page
   |    |         |-- *.html                # All other pages
   |    |    
   |  config.py                             # Set up the app
   |    __init__.py                         # Initialize the app
   |
   |-- requirements.txt                     # App Dependencies
   |
   |-- .env                                 # Inject Configuration via Environment
   |-- run.py                               # Start the app - WSGI gateway
   |
   |-- ************************************************************************
```
