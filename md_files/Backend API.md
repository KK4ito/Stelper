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
			responses: [
				200: {
					returnName: [
						description: ...,
						type: string/number/date/...
						content: {}
					]
				}
				404 : ...
			]

---

#### users by filter

	/users?radius=value1&category=value2
		get{radius=value1&category=value2}: gets all users fullfilliing the filter
			responses: [ 
				200: {
					users: [
						type = array,
						content: {
							#user
						}
					]
				},
				400: {
					error: { "no matchings" }
				},
				400: {
					error: { "invalid radius" }
				},
				400: {
					error: { "invalid category" }
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
				},
				#idrequired400,
				#idunvalid400,
				#notauthorized401,
				#insufficientrights401
			]
		post: create a new user
			parameters: [
				user: {
					type: object,
					content: {
						name: { type = string },
						firstname: { type = string },
						email: { type = string },
						telefon: { type = number },
						password: { type = string }
					}
				}
			],
			responses: [ 
				201: {
					#user
				},
				400: { "invalid content for user" }
			]
		put: update user information
			parameters: [
				user: {
					type = object
					content: {
						name: { type = string },
						firstname: { type = string },
						location: { type = string, format = ? },
						street: { type = string },
						streetnumber: { type = number },
						postalcode: { type = number },
						place: { type = string },
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
			],
			responses: [ 
				200: {
					#user
				},
				#idrequired400,
				#idunvalid400
			]
		delete: delete a user
			responses: [ 
				204 : OK,
				#idrequired400,
				#idunvalid400
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
				#idrequired400,
				#idunvalid400,
				400: {
					error: {
						type = string,
						value: { "old password unvalid" }
					}
				},
				400: {
					error: {
						type = string,
						value: { "new password unvalid" }
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
						#message
					]
				},
				#unauthorized401,
				#insufficientrights401,
				#idrequired400,
			]
		post:
			parameters: [
				#message
			]
			responses: [ 
				201: OK,
				#idrequired400,
				#idunvalid400
			]

---

#### categories

	/categories/{userId}
		get {user id}: gets all categories one does offer
			responses: {
				200: {
					categories: [
						type: array,
						category: { type : string }
					]
				},
				#idunvalid400
			}
		get {no user id}: gets all categories that exist so far 
			response: {
				200: {
					categories: [
						type: array,
						category: { type = string }
					]
				}
			}
			
---

#### token

	/token
		
	
---

### Object Definitions

In diesem Abschnitt werden einige der häufig verwendeten json objekte definiert

#### user

	user: {
		type = object
		content: {
			id: { type : number },
			name: { type = string },
			firstname: { type = string },
			location: { type = string, format = ? },
			street: { type = string },
			streetnumber: { type = number },
			postalcode: { type = number },
			place: { type = string },
			email: { type = string },
			telefon: { type = number },
			messages: [
				type = array,
				content: {
					#message
				}
			],
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
	
---
### Response Definitions

In diesem Abschnitt werden einige der häufigen Response Codes beschrieben

#### idrequired400

	400: {
		error: {
			type = string,
			value: { "id required" }
		}
	}
	
#### idunvalid400

	400: {
		error: {
			type = string,
			value: { "unvalid id" }
		}
	}

#### notauthorized401

	401: {
		error: {
			type = string,
			value: { "unauthorized" }
		}
	}

#### insufficientrights401

	401: {
		error: {
			type = string,
			value: { "insufficient system rights" }
		}
	}