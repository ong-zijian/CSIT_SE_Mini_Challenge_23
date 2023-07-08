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

Note to self:
docker build -t smuozj/rabbit_se_challenge:1.0.0 -f server.Dockerfile .
docker push smuozj/rabbit_se_challenge:1.0.0

### To Pull
docker pull smuozj/rabbit_se_challenge:1.0.0
docker run -p 8080 smuozj/rabbit_se_challenge:1.0.0