# API Doc

## /flight
For this route, the functionality will be to:
1. Connect to the flights collection
2. Handle errors:
- Missing fields
- Incorrect ISO date
3. Query departure flights by the departure date and destination
4. Query arrival flights by the return date and srccity
5. Match flights:
- We will iterate the departure flight first
- We will then search for return flights that fit the criteria (i.e. arrive and depart from the same airport code)
- If it is a match and lower than the price variable, we will update the pair
6. Return the final pair in json format

## /hotel
For this route, the functionality will be to:
1. Connect to the hotels collection
2. Handle errors:
- Missing fields
- Incorrect ISO date
3. Query the hotels by the destination
4. Map the data into the response:
- Group by hotel
- Validate availability
- Calculate total price
5. Return sorted final array in json format

Note to self (uploading the image):<br>
docker build -t smuozj/rabbit_se_challenge:1.0.0 -f server.Dockerfile .<br>
docker push smuozj/rabbit_se_challenge:1.0.0

### To Pull
1. Ensure that you have installed docker
2. Run docker desktop app
3. Run `docker pull smuozj/rabbit_se_challenge:1.0.0`
4. Run `docker run -p 8080 smuozj/rabbit_se_challenge:1.0.0` wait till you see "Pinged your deployment. You successfully connected to MongoDB!"
5. Go to docker desktop and check the port number. it will show like `44321:8080`. Hover over and it will show you what is the url. Usually it will be like `http://localhost:44321`

### To run:
Go to Postman or Chrome and run get commands:
- `http://localhost:<insert-port-number>/flight?departureDate=2023-12-10&returnDate=2023-12-16&destination=Frankfurt`
- `http://localhost:<insert-port-number>/hotel?checkInDate=2023-12-10&checkOutDate=2023-12-16&destination=Frankfurt`
