### Definition der Schnittstellen zur Kommunikation mit dem Backend

Dieser url path wird automatisch vorangehängt: {ipV4-address to server}/api/

Die html response codes können hier nachgesehen werden:
* [html response codes] (https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)

---

#### Aufrufen von Ressourcen / Funktionen

**Es gelten hierbei folgende Definitionen:**

1. `post: add new entity`
2. `put: update entity`

---

#### Genereller Aufbau

	/{ressource}?{parameter}
		verb{options}: description
			parameters: [
				paramName: [
					description: ...,
					type: string/number/date...
				]
			],
			respones: [
				200: {
					returnName: [
						description: ...,
						type: string/number/date/...
						content: {}
					]
				}
				{404} : ...,
				etc
			]

---

#### users by filter

	/users?radius=value1&category=value2
		get{radius=value1&category=value2}: gets all users fullfilliing the filter
			responses: [ 
				200: {
					users: [
						type = array
						content: {
							#user
						}
					]
				}
			]

---

#### users by user-id

	/users/{userId}
		get{id=undefined}:  gets all users
			responses: [ 
				200: {
					users: [
						type = array
						content: {
							#user
						}
					]
				}
			]
		get{id=value}: gets the requested user
			responses: [
				200: {
					#user
				}
			]
		post: create a new user
			responses: [ 
				201 : {
					#user
				}
			]
		put: update user information
			responses: [ 
				200: {
					#user
				} 
			]
		delete: delete a user
			responses: [ 
				204 : OK
			]

---

#### user password by user-id

	/users/{userId}/password
		put: update password
			parameters: [
				oldPassword: [ type: string ],
				newPassword: [ type: string ]
			]
			responses: [ 
				204: OK,
				400: {
					error: {
						type = string,
						value: { "user id required" }
					}
				}
			]

---

#### messages by user-id

	/messages/{userId}
		get: get all messages for specified user
			responses: [ 
				200: {
					messages: [
						type = array,
						
					]
				},
				401: Unauthorized,
				400: {
					error: {
						type = string,
						value: { "user id required" }
					}
				}
			]
		post:
			parameters: [
				#message
			]
			responses: [ 
				{201} : OK
			]

---

#### categories

	/categories/{id}
	
---

### Object Definitions

In diesem Abschnitt werden einige der häufig verwendeten json objekte definiert

#### user

	user: {
		type = object
		content: {
			username: { type = string },
			location: { type = string, format = ? },
			messages: [
				type = array,
				content: {
					#message
				}
			],
			email: { type = string },
			telefon: { type = number },
			lessons: [
				type = array,
				content: {
					#lesson
				}
			] 
		}
	}
	
#### lesson
	
	lesson: {
		type = object,
		content: {
			category: { type = string},
			description { type = string },
			reviews: [
				type = array,
				content: {
					#review
				}
			]
		}
	}

#### message

	message: {
		type = object,
		content: {
			date: { type = date },
			text: { type = string }
		}
	}
	
#### review

	review: {
		type = object,
		content: {
			date: { type = date },
			text: { type = string },
			rating: { type = number }
		}
	}