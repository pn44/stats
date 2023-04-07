# TruNews
Get unbiased news witout the twist of media directly from the source. No ads, no tracking. Just the headlines.

The project consists of 3 parts - a backend, a daemon (which does the actual work) and an app.
Link to daemon: (will be uploaded soon...)
Link to backend: https://github.com/amsdc/trunews-backend (this project)
Link to app: (yet to start)

# **⚠️WARNING!⚠️** This project is under development!

# Developer Manual
## Environment Variables
Variable Name | Description
--|--
`FLASK_APP` | The Flask App Instance to run. Must be `rms.py` 
`FLASK_ENV` | The Environment to run in. `development` or `production` 
`MYSQL_HOST` | name of host to connect to. Default: use the local host via a UNIX socket (where applicable)
`MYSQL_USER` | user to authenticate as. Default: current effective user.
`MYSQL_PASSWORD` | password to authenticate with. Default: no password.
`MYSQL_DB` | database to use. Default: no default database.
`MYSQL_PORT` | TCP port of MySQL server. Default: 3306.
`MYSQL_UNIX_SOCKET` | location of UNIX socket. Default: use default location or TCP for remote hosts.
`MYSQL_CONNECT_TIMEOUT` | Abort if connect is not completed within given number of seconds.Default: 10
`MYSQL_READ_DEFAULT_FILE` | MySQL configuration file to read; see the MySQL documentation for mysql_options(). using the configured character set.
`MYSQL_CHARSET` | If present, the connection character set will be changed to this character set, if they are not equal. Default: 'utf-8'
`MYSQL_SQL_MODE` | If present, the session SQL mode will be set to the given string.
`MYSQL_CURSORCLASS` | If present, the cursor class will be set to the given string.
`MYSQL_AUTOCOMMIT` | If enabled, will use the autocommit feature of MySQL. Default: False
`MYSQL_CUSTOM_OPTIONS` | `dict` of options you want to set in this format: {option: value}. See all available option [here](https://mysqlclient.readthedocs.io/user_guide.html#functions-and-attributes). Default: `None`
## Install and run the application
A `requirements.txt` file will be soon provided to install dependencies.
1. Create a Virtual Environment: `py -m venv venv`
2. Install the dependencies by using: `pip install -r requirements.txt`
3. Activate it by using `venv\Scripts\activate`
4. Create a `.env` (`.flaskenv` for development) file and fill it with the above environment variables in a `variable=value` format.
5. Execute the app using `flask run`. The app loads opn port 5000.

> **NOTE:** To run the application after setting up, repeat steps 3 and 5.

## API Docs
### Schemas
#### User
```
{
    "user_id": integer: The unique user ID,
    "email": string: The user email,
    "password": string: The user password,
    "2fa": bool: If 2FA is on or off. Off by default,
    "user_type": string: The role i.e. "manager" or "customer"
}
```

#### Token
```
{
    "token": string: The Login Token (JWT)
}
```

#### TOTP
```
{
    "secret": string: The TOTP secret,
    "url": string: The OTP url. Use for QR generation.,
    "token": string: The 6-digit OTP token
}
```

#### Provider
```
{
    "id": int: Database ID of provider,
    "name": string,
    "country": string,
    "module_name": string (unique)
}
```



### GET `/api/users/sign_in`
User sign-in using HTTP Basic Authentication
Example (correct login details):
```
ubuntu@DESKTOP-4J0CFJ5:~$ curl -u default:aknp_are_awesome -i http://127.0.0.1:5000/api/users/sign_in
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 151
Connection: close

{
    "token": "eyJ0e[...]B-J2E"
}
```
Incorrect credentials:
```
ubuntu@DESKTOP-4J0CFJ5:~$ curl -u incorrect:login_details -i http://127.0.0.1:5000/api/users/sign_in
HTTP/1.1 403 FORBIDDEN
Content-Type: application/json
Content-Length: 50
Connection: close

{
    "message": "Invalid username or password"
}
```

### POST `/api/users/sign_up`
Create a new user
```
ubuntu@DESKTOP-4J0CFJ5:~$ curl -H "Content-Type: application/json" -d "{\"username\":\"test\", \"password\":\"test\"}" -
i http://127.0.0.1:5000/api/users/sign_up
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 5
Connection: close
```
