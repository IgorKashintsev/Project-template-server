const fetch = require('node-fetch')

function dateToUnixStamp(date) {
  return date.getTime() / 1000
}

function responseToJson(requestPromise) {
  return requestPromise
    .then((response) => {
      return response.text()
    })
    .then((response) => {
      return JSON.parse(response)
    })
}

function search(checkInDate, checkOutDate, maxPrice) {
  let url = `http://localhost:3030/places?` +
  `checkInDate=${dateToUnixStamp(checkInDate)}&` +
  `checkOutDate=${dateToUnixStamp(checkOutDate)}&` +
  `coordinates=59.9386,30.3141`

  if (maxPrice != null) {
    url += `&maxPrice=${maxPrice}`
  }

  return responseToJson(fetch(url))
}

function book(placeId, checkInDate, checkOutDate) {
  return responseToJson(fetch(
    `http://localhost:3030/places/${placeId}?` +
    `checkInDate=${dateToUnixStamp(checkInDate)}&` +
    `checkOutDate=${dateToUnixStamp(checkOutDate)}&`,
    {method: 'PATCH'}
  ));
}

const checkInDate = new Date()
const checkOutDate = new Date()
checkOutDate.setDate(checkOutDate.getDate() + 2)

console.log(checkInDate.getTime(), checkOutDate.getTime())


search(checkInDate, checkOutDate, 2800)
.then((results) => {
  console.log('places length', results.length)

  const place = results[0]
  book(place.id, checkInDate, checkOutDate)
  .then((result) => {
    console.log('booked', result.bookedDates)

    search(checkInDate, checkOutDate)
    .then((results) => {
      console.log('places length', results.length)
    })
  })
})
