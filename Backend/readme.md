
# Frontend with Back Logic

## Introduction
Nigga. This branch is for testing and determining what to add and to test the API.

---

## Setting Up Your Local Development Environment

To get started with the project, you'll need to set up your local environment, including the necessary configuration files.

---


## 1.Clone the Repository

Start by cloning the project to your local machine:

```bash
  git clone https://github.com/your-username/project-name.git
cd project-name
```
---
## 2.Create an .env File
The .env file contains sensitive information like your Django SECRET_KEY, database credentials, and API keys. Do not share your .env file with others or commit it to version control. A .env file should look like the following:

Copy the .env.example file (or create one if it doesn't exist):
```bash
    cp .env.example .env
```
Open the .env file and replace the placeholder values with your own keys and credentials.
Look at .env.example or Copy this below:
### Django settings
SECRET_KEY=django-insecure-<your-secret-key-here>

DEBUG=True
### Database settings
DB_NAME=your_database_name

DB_USER=your_database_user

DB_PASSWORD=your_database_password

DB_HOST=localhost

DB_PORT=3306

---
Note: If you're unsure about generating a new SECRET_KEY for Django, you can run the following command in your Python shell to generate a random one:

Open Command Line or Use your IDE Terminal to run Python Shell

Run python on Shell:
```bash
  python
```

### Then:
Import the required util:
```bash
from django.core.management.utils import get_random_secret_key
```
Print your own secret key:
```bash
print(get_random_secret_key())
```

### Copy the generated Secret key and place it inside your .env file
SECRET_KEY=django-insecure-<your-secret-key-here>

---

## 3.Install Dependencies Using Pipenv
This project uses Pipenv for dependency management. Pipenv simplifies virtual environment creation and management, and it automatically handles dependencies from the Pipfile.

Install Pipenv if you don't have it installed yet:

```bash
  pip install pipenv
```
Install the dependencies listed in the Pipfile and Pipfile.lock:

```bash
  pipenv install
```
This will create a virtual environment and install the necessary dependencies for the project. If you're using Pipenv for the first time, it will also create a new virtual environment specific to the project.

Tip: To activate the virtual environment, use:

```bash
  pipenv shell
```

---
## 4.Apply Migrations
Run the following Django management commands to apply the database migrations:

```bash
    python manage.py migrate
```

---
## 5.Run the Development Server
Now, you're ready to start the project locally. Run the Django development server:

```bash
  python manage.py runserver
```
