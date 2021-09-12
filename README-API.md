<h1 id="messaging-service-auth">auth</h1>

## Create new user.

<a id="opIdAuthController_register"></a>

`POST /auth/register`

> Body parameter

```json
{
  "username": "gandalf",
  "password": "123"
}
```

<h3 id="create-new-user.-parameters">Parameters</h3>

| Name | In   | Type                                                | Required | Description |
| ---- | ---- | --------------------------------------------------- | -------- | ----------- |
| body | body | [LoginRegisterPayload](#schemaloginregisterpayload) | true     | none        |

<h3 id="create-new-user.-responses">Responses</h3>

| Status | Meaning                                                          | Description                           | Schema |
| ------ | ---------------------------------------------------------------- | ------------------------------------- | ------ |
| 201    | [Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)     | The user has successfully registered. | None   |
| 400    | [Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) | Username and/or password not entered. | None   |
| 409    | [Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8)    | Username already taken.               | None   |

<aside class="success">
This operation does not require authentication
</aside>

## Get JWT token for given credentials.

<a id="opIdAuthController_login"></a>

`POST /auth/login`

> Body parameter

```json
{
  "username": "gandalf",
  "password": "123"
}
```

<h3 id="get-jwt-token-for-given-credentials.-parameters">Parameters</h3>

| Name | In   | Type                                                | Required | Description |
| ---- | ---- | --------------------------------------------------- | -------- | ----------- |
| body | body | [LoginRegisterPayload](#schemaloginregisterpayload) | true     | none        |

> Example responses

> 200 Response

```json
{
  "userId": "string",
  "accessToken": "string"
}
```

<h3 id="get-jwt-token-for-given-credentials.-responses">Responses</h3>

| Status | Meaning                                                         | Description                   | Schema |
| ------ | --------------------------------------------------------------- | ----------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | Successful login.             | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Invalid username or password. | None   |

<h3 id="get-jwt-token-for-given-credentials.-responseschema">Response Schema</h3>

Status Code **200**

| Name          | Type   | Required | Restrictions | Description |
| ------------- | ------ | -------- | ------------ | ----------- |
| » userId      | string | false    | none         | none        |
| » accessToken | string | false    | none         | none        |

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="messaging-service-messages">messages</h1>

## Get all messages of authenticated user

<a id="opIdMessageController_getAllMessages"></a>

`GET /messages`

> Example responses

> 200 Response

```json
[
  {
    "id": "613a29143f3ee85b7b4ad9e1",
    "message": "hello, how are u?",
    "sender": "gandalf",
    "receiver": "yoda",
    "createdAt": "2021-09-09T16:48:22.208Z"
  }
]
```

<h3 id="get-all-messages-of-authenticated-user-responses">Responses</h3>

| Status | Meaning                                                         | Description                                                     | Schema |
| ------ | --------------------------------------------------------------- | --------------------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | List of messages of between authenticated user and other users. | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized access.                                            | None   |

<h3 id="get-all-messages-of-authenticated-user-responseschema">Response Schema</h3>

Status Code **200**

| Name        | Type                                        | Required | Restrictions | Description |
| ----------- | ------------------------------------------- | -------- | ------------ | ----------- |
| _anonymous_ | [[MessageResponse](#schemamessageresponse)] | false    | none         | none        |
| » id        | string                                      | true     | none         | none        |
| » message   | string                                      | true     | none         | none        |
| » sender    | string                                      | true     | none         | none        |
| » receiver  | string                                      | true     | none         | none        |
| » createdAt | string                                      | true     | none         | none        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## Send message from authenticated user to given user

<a id="opIdMessageController_sendMessage"></a>

`POST /messages`

> Body parameter

```json
{
  "receiver": "yoda",
  "message": "hello, how are u?"
}
```

<h3 id="send-message-from-authenticated-user-to-given-user-parameters">Parameters</h3>

| Name | In   | Type                                            | Required | Description |
| ---- | ---- | ----------------------------------------------- | -------- | ----------- |
| body | body | [SendMessagePayload](#schemasendmessagepayload) | true     | none        |

> Example responses

> 200 Response

```json
"613a29143f3ee85b7b4ad9e1"
```

<h3 id="send-message-from-authenticated-user-to-given-user-responses">Responses</h3>

| Status | Meaning                                                        | Description                                  | Schema |
| ------ | -------------------------------------------------------------- | -------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)        | Message sended successfully.                 | string |
| 403    | [Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3) | Authenticated user blocked by receiver user. | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) | Receiver username not found in DB.           | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

## Get messages between authenticated user and given user

<a id="opIdMessageController_getMessagesWithUser"></a>

`GET /messages/{username}`

<h3 id="get-messages-between-authenticated-user-and-given-user-parameters">Parameters</h3>

| Name     | In   | Type   | Required | Description |
| -------- | ---- | ------ | -------- | ----------- |
| username | path | string | true     | none        |

> Example responses

> 200 Response

```json
[
  {
    "id": "613a29143f3ee85b7b4ad9e1",
    "message": "hello, how are u?",
    "sender": "gandalf",
    "receiver": "yoda",
    "createdAt": "2021-09-09T16:48:22.208Z"
  }
]
```

<h3 id="get-messages-between-authenticated-user-and-given-user-responses">Responses</h3>

| Status | Meaning                                                         | Description                                                    | Schema |
| ------ | --------------------------------------------------------------- | -------------------------------------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | List of messages of between authenticated user and given user. | Inline |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized access.                                           | None   |

<h3 id="get-messages-between-authenticated-user-and-given-user-responseschema">Response Schema</h3>

Status Code **200**

| Name        | Type                                        | Required | Restrictions | Description |
| ----------- | ------------------------------------------- | -------- | ------------ | ----------- |
| _anonymous_ | [[MessageResponse](#schemamessageresponse)] | false    | none         | none        |
| » id        | string                                      | true     | none         | none        |
| » message   | string                                      | true     | none         | none        |
| » sender    | string                                      | true     | none         | none        |
| » receiver  | string                                      | true     | none         | none        |
| » createdAt | string                                      | true     | none         | none        |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

<h1 id="messaging-service-user">user</h1>

## Block given username for messaging to authenticated user.

<a id="opIdUserController_blockUser"></a>

`PATCH /user/block/{username}`

<h3 id="block-given-username-for-messaging-to-authenticated-user.-parameters">Parameters</h3>

| Name     | In   | Type   | Required | Description |
| -------- | ---- | ------ | -------- | ----------- |
| username | path | string | true     | none        |

<h3 id="block-given-username-for-messaging-to-authenticated-user.-responses">Responses</h3>

| Status | Meaning                                                         | Description                         | Schema |
| ------ | --------------------------------------------------------------- | ----------------------------------- | ------ |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)         | The user has successfully blocked.  | None   |
| 401    | [Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) | Unauthorized access.                | None   |
| 404    | [Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)  | The user to block not exists in DB. | None   |

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearer
</aside>

# Schemas

<h2 id="tocS_LoginRegisterPayload">LoginRegisterPayload</h2>
<!-- backwards compatibility -->
<a id="schemaloginregisterpayload"></a>
<a id="schema_LoginRegisterPayload"></a>
<a id="tocSloginregisterpayload"></a>
<a id="tocsloginregisterpayload"></a>

```json
{
  "username": "gandalf",
  "password": "123"
}
```

### Properties

| Name     | Type   | Required | Restrictions | Description |
| -------- | ------ | -------- | ------------ | ----------- |
| username | string | true     | none         | none        |
| password | string | true     | none         | none        |

<h2 id="tocS_MessageResponse">MessageResponse</h2>
<!-- backwards compatibility -->
<a id="schemamessageresponse"></a>
<a id="schema_MessageResponse"></a>
<a id="tocSmessageresponse"></a>
<a id="tocsmessageresponse"></a>

```json
{
  "id": "613a29143f3ee85b7b4ad9e1",
  "message": "hello, how are u?",
  "sender": "gandalf",
  "receiver": "yoda",
  "createdAt": "2021-09-09T16:48:22.208Z"
}
```

### Properties

| Name      | Type   | Required | Restrictions | Description |
| --------- | ------ | -------- | ------------ | ----------- |
| id        | string | true     | none         | none        |
| message   | string | true     | none         | none        |
| sender    | string | true     | none         | none        |
| receiver  | string | true     | none         | none        |
| createdAt | string | true     | none         | none        |

<h2 id="tocS_SendMessagePayload">SendMessagePayload</h2>
<!-- backwards compatibility -->
<a id="schemasendmessagepayload"></a>
<a id="schema_SendMessagePayload"></a>
<a id="tocSsendmessagepayload"></a>
<a id="tocssendmessagepayload"></a>

```json
{
  "receiver": "yoda",
  "message": "hello, how are u?"
}
```

### Properties

| Name     | Type   | Required | Restrictions | Description |
| -------- | ------ | -------- | ------------ | ----------- |
| receiver | string | true     | none         | none        |
| message  | string | true     | none         | none        |
