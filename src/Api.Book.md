```js
POST /api/book
```` 

```json
{
	"title": "The Lord of the Rings",
	"author": "J.R.R. Tolkien",
	"isbn": 0000000000000,
}
```

```js
GET /api/books/:qr
```

```json
{
	"title": "The Lord of the Rings",
	"author": "J.R.R. Tolkien",
	"isbn": 0000000000000,
	"qr": "0000000000000"
	"locations": [
	 {
	  "latitude": 0.000000,
	  "longitude": 0.000000,
	  "timestamp": 0000000000000
	 }
	]
	}
```