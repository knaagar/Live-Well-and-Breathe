const email = {
	signup: (domainName, token) => `
		<!DOCTYPE html>
		<html>
				<head>
						<meta charset = "utf-8">
						<title>Verify your Account</title>
						<style>
								* {
										margin : 0;
										padding : 0;
								}

								body {
										background-color : none;
								}

								#main {
										margin : 50px 100px;
										padding : 25px 50px;
								}
						</style>
				</head>
				<body>
						<div id = "main">
								<p>Follow the link below to verify your Live Well And Breathe account:</p>
								<a href = "${domainName}/api/verify/${token}">Verify</a>
								<p>If you have not created a Live Well and Breathe account through this email, someone may be impersonting you or using your email. Do not click the above link, and you can reply to this email for the account to be terminated, if necessary.</p>
						</div>
				</body>
		</html>`,
	verify: (domainName, token) => `
		<!DOCTYPE html>
		<html>
				<head>
						<meta charset = "utf-8">
						<title>Verify your New Email</title>
						<style>
								* {
										margin : 0;
										padding : 0;
								}

								body {
										background-color : none;
								}

								#main {
										margin : 50px 100px;
										padding : 25px 50px;
								}
						</style>
				</head>
				<body>
						<div id = "main">
								<p>Follow the link below to verify your new Live Well And Breathe email:</p>
								<a href = "${domainName}/api/verify/${token}">Verify</a>
								<p>If you have not requested this email be set to your new Live Well and Breathe email, there may have been a mistake. You can ignore the link above. </p>
						</div>
				</body>
		</html>`,
	forgotPassword: (domainName, token) => `
		<!DOCTYPE html>
		<html>
				<head>
						<meta charset = "utf-8">
						<title>Reset Password</title>
						<style>
								* {
										margin : 0;
										padding : 0;
								}

								body {
										background-color : none;
								}

								#main {
										margin : 50px 100px;
										padding : 25px 50px;
								}
						</style>
				</head>
				<body>
						<div id = "main">
								<p>Follow the link below to reset your Live Well and Breathe password:</p>
								<a href = "${domainName}/api/get-reset-password/${token}">Reset</a>
						</div>
				</body>
		</html>`,
	contact: (name, email, content) => `
		<!DOCTYPE html>
		<html>
				<head>
						<meta charset = "utf-8">
						<title>Contact Email</title>
						<style>
								* {
										margin : 0;
										padding : 0;
								}

								body {
										background-color : none;
								}

								#main {
										margin : 50px 100px;
										padding : 25px 50px;
								}
						</style>
				</head>
				<body>
						<div id = "main">
								<p>${name} (${email}) has contacted you from Live Well and Breathe.</p>
								<p>${content}</p>
						</div>
				</body>
		</html>`
};

module.exports = email;