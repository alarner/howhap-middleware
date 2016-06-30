# Houston, we have a problem - express middleware

A small library for displaying errors from express

`npm install --save howhap`

## app.js
```js
let express = require('express');
let howhap = require('howhap-middleware');

// An *optional* preset list of errors.
let options = {
	errors: {
		DEFAULT: {
			message: 'An unknown error occurred.',
			status: 500,
			level: 'error'	// this property specified what
							// level of logging is associated
							// with this error.
		},
		AUTH: {
			INVALID_EMAIL: {
				message: '{{ email }} is not a valid email.',
				status: 400
			},
			MISSING_PASSWORD: {
				message: 'Please enter a password.',
				status: 400
			}
		}
	},
	defaultFormat: 'json',	// If no response format is supplied,
							// responses will be in this format.
	logging: {
		// options for winston loggin go here
	}
};

let app = express();

// Pass in the option argument to customize the behavior 
// of the middleware. Alternatively you can pass in nothing
// and use the default behavior.
app.use(howhap(options));

```

## example route
```js
let express = require('express');
let router = express.Router();
let validator = require('validator');

router.post('/login', function(req, res, next) {
	let minPasswordLength = 8;
	// You can call a preset error by using dot notation to
	// traverse the predefined object and pass in parameters
	// as the second argument. Errors are keyed by any string
	// for later use. In this case 'email'.
	if(!validator.isEmail(req.body.email)) {
		res.error.add('AUTH.INVALID_EMAIL', {email: req.body.email}, 'email');
	}
	// Parameters are not required. Nor is the error key,
	// which will be 'default' if none is specified.
	if(!req.body.password) {
		res.error.add('AUTH.MISSING_PASSWORD');
	}
	// You can also add custom error messages on the fly.
	// Parameters can be specified in one object or passed
	// in as a second argument like in the email example.
	else if(req.body.password.length < minPasswordLength) {
		res.error.add({
			message: 'Your password must be at least {{ num }} chars long.',
			status: 400,
			params: {
				num: minPasswordLength
			}
		}, 'password');
	}

	// Other code goes here...

	// Send the errors and redirect back to the login page.
	// If no argument is passed to the first argument of the
	// send method then you will redirect back to the referer.
	// The send method will return false if there are no errors
	// to send. The send method takes a optional second argument
	// specifying the response format you would like ('html' or
	// 'json'). If there is no response format specified, it
	// will fallback to the 'defaultFormat' option passed in to
	// the middleware. If the format is 'html' the user will be
	// redirected to the specified redirect. Otherwise json will
	// be returned.
	if(!res.error.send('/login', 'html')) {
		// There were no errors, redirect.
		res.redirect('/dashboard');
	}

	// Here's an example of sending json
	//
	// if(!res.error.send(null, 'json')) {
	// 	res.json(user);
	// }
});
```

## example view
```html
<!DOCTYPE html>
<html>
	<head>
		<title>Log in</title>
		<link rel='stylesheet' href='/styles/main.scss.css' />
	</head>
	<body>
		<h1>Log in</h1>
		<form action="/auth/login" method="post">
			<div>
				<!--
				   - An `error` object is passed to all views, with a
				   - display method. The first argument is the key
				   - of the error that you'd like to display. The
				   - second (optional) argument is a default value
				   - that you'd like to display if there is no error
				   - for the specified key.
				   -->
				<%= error.display('email') %>
				<!--
				   - A `prev` object is also passed to all views,
				   - which stores the previous data that was posted
				   - (body, query, and params). This data is only set
				   - if there was an error. It takes two arguments
				   - (the type of data and the key) as well as an
				   - optional third argument if there was no data
				   - found for that particular key.
				   -->
				<input type="email" placeholder="email" name="email" value="<%= prev.display('body', 'email') %>">
			</div>
			<div>
				<!-- Example of using the optional default (second argument) -->
				<%= error.display('email', 'Bad password') %>
				<input type="password" placeholder="password" name="password">
			</div>
			<button>Log in</button>
		</form>
	</body>
</html>

```