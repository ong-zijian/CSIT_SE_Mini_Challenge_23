const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require("express");
// the username and password will be the admin username and password that you would use when u click connect
const uri = "mongodb+srv://userReadOnly:7ZT817O8ejDfhnBM@minichallenge.q4nve1r.mongodb.net/";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToCluster() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return client;
  } catch (error) {
    console.error("Connection to MongoDB failed!", error);
    process.exit(1);
  }
}

// This is to set the connection to the cluster to allow for get request
module.exports = connectToCluster;

// Immediately call the connectToCluster function
connectToCluster().catch(console.dir);


const app = express();
const port = process.env.PORT || 8080;

app.use(express.json()); 

const router = express.Router();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get /flight route
router.get("/flight", async (req, res) => {
    try {
      // Connect to: db & collection
      const client = await connectToCluster();
      const database = client.db("minichallenge");
      const test = database.collection("flights");
  
      // query parameters that appear in the url
      const departureDate = req.query.departureDate;
      const returnDate = req.query.returnDate;
      const destination = req.query.destination;
      
      // Validate the query parameters
      if (!departureDate || !returnDate || !destination) {
        const missingFields = [];
        if (!departureDate) {
          missingFields.push("Departure Date");
        }
        if (!returnDate) {
          missingFields.push("Return Date");
        }
        if (!destination) {
          missingFields.push("Destination");
        }
        console.log(`(Code 400) Bad Request: Please provide the following field(s): ${missingFields.join(", ")}`)
        return res
          .status(400)
          .json({ code: 400, error: `Bad Request: Please provide the following field(s): ${missingFields.join(", ")}` });
      }

      // Validate the departureDate format
      if (!isValidISODate(departureDate) || !isValidISODate(returnDate)) {
          const error = []
          if (!isValidISODate(departureDate)) {
              error.push("Departure Date");
            }
            if (!isValidISODate(returnDate)) {
              error.push("Return Date");
            }
            console.log(`Bad Request: Invalid date format for: ${error.join(", ")}. Please provide a valid ISO date.`)
          return res.status(400).json({ code: 400, error: `Bad Request: Invalid date format for: ${error.join(", ")}. Please provide a valid ISO date.` });
      }

      // validate destination data type
      if (!destination || typeof destination !== "string" || /[0-9~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(destination)) {
        console.log("(Code 400) Bad Request: Destination should be a valid string without numbers or special characters");
        return res.status(400).json({ code: 400, error: "Bad Request: Destination should be a valid string without numbers or special characters" });
      }

  
      // Query for the departure flight based on departure date and destination
      const departureQuery = {
        date: new Date(departureDate),
        destcity: destination,
      };
      const departureFlights = await test.find(departureQuery).toArray();
  
      // Query for the return flight based on return date and source city (Frankfurt)
      const returnQuery = {
        date: new Date(returnDate),
        srccity: destination,
      };
      const returnFlights = await test.find(returnQuery).toArray();
  
      // Using the sort function and declaring price for the (a,b), a binary sort is performed
      const sortedDepartureFlights = departureFlights.sort((a, b) =>a.price - b.price);
      const sortedReturnFlights = returnFlights.sort((a, b) => a.price - b.price);
  
      // Find all possible flight combinations and calculate the total price
      const flightCombinations = [];
      departureFlights.forEach((departureFlight) => {
      returnFlights.forEach((returnFlight) => {
          if (departureFlight.srcairportid === returnFlight.destairportid) {
          const totalPrice = departureFlight.price + returnFlight.price;
          flightCombinations.push([
            {
              "Departure Date": departureDate,
              "Departure Airline": departureFlight.airlinename,
              "Departure Price": departureFlight.price,
              "Return Date": returnDate,
              "Return Airline": returnFlight.airlinename,
              "Return Price": returnFlight.price,
            },
            totalPrice,
          ]);
          }
      });
      });
    
      flightCombinations.sort((a, b) => a[1] - b[1]);
      const sortedHashmaps = flightCombinations.map((combination) => combination[0]);
      
      res.status(200).json(sortedHashmaps);
      console.log("http code: (200) success")
  
      client.close(); // Close the connection when done
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      res.status(500).json({ code: 500, error: "Error connecting to MongoDB" });
    }
  });
  
// Function to validate ISO date format
function isValidISODate(dateStr) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return isoDateRegex.test(dateStr);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Route Hotel
router.get("/hotel", async (req, res) => {
    try {
        // Connect to: db & collection
        const client = await connectToCluster();
        const database = client.db("minichallenge");
        const hotel = database.collection("hotels");

        // query parameters that appear in the url
        const checkInDate = new Date(req.query.checkInDate);
        const checkOutDate = new Date(req.query.checkOutDate);
        const destination = req.query.destination;

        // Validate the query parameters
        if (!checkInDate || !checkOutDate || !destination || isNaN(checkInDate) || isNaN(checkOutDate)) {
          const missingFields = [];
          if (!checkInDate || isNaN(checkInDate)) {
            missingFields.push("Check In Date");
          }
          if (!checkOutDate || isNaN(checkOutDate)) {
            missingFields.push("Check Out Date");
          }
          if (!destination) {
            missingFields.push("Destination");
          }
          console.log(`(Code 400) Bad Request: Please provide the following field(s): ${missingFields.join(", ")}`)
          return res.status(400).json({ code: 400, error: `Bad Request: Please provide the following field(s): ${missingFields.join(", ")}` });
        }

        // Validate the departureDate format
        if (!isValidISODate(req.query.checkInDate) || !isValidISODate(req.query.checkOutDate)) {
            const error = []
            if (!isValidISODate(checkInDate)) {
              error.push("Check In Date");
            }
            if (!isValidISODate(checkOutDate)) {
              error.push("Check Out Date");
            }
            console.log(`(Code 400) Bad Request: Invalid date format for: ${error.join(", ")}. Please provide a valid ISO date.`)
            return res.status(400).json({code: 400, error: `Bad Request: Invalid date format for: ${error.join(", ")}. Please provide a valid ISO date.` });
        }

        // validate destination data type
        if (!destination || typeof destination !== "string" || /[0-9~`!@#$%^&*()\-_=+[{\]}\\|;:'",<.>/?]/.test(destination)) {
          console.log("(Code 400) Bad Request: Destination should be a valid string without numbers or special characters");
          return res.status(400).json({ code: 400, error: "Bad Request: Destination should be a valid string without numbers or special characters" });
        }

        // Query the hotels by destination
        const hotelQuery = {
            city: destination,
          };
        const hotels = await hotel.find(hotelQuery).toArray();

        // Create a hashmap that has key = hotel and value = [ array of dates, total price]
        // the validation will only allow those from the check in and out dates and unique dates
        const hm = {}
        hotels.forEach(hotel => {
            if (!hm[hotel.hotelName]){
              if (checkInDate <= hotel.date && checkOutDate >= hotel.date){
                hm[hotel.hotelName] = [[hotel.date], hotel.price];
                
              }
            }
            else{
              if (checkInDate <= hotel.date && checkOutDate >= hotel.date){
                if (!hm[hotel.hotelName][0].includes(hotel.date)) {
                  hm[hotel.hotelName][0].push(hotel.date);
                  hm[hotel.hotelName][1] += hotel.price;
                }
              }
            }
            
        });

        const dateRange = new Date(checkOutDate - checkInDate).getDate();

        const result = [];
        
        // we will append the results but checking the date array to ensure that the length is correct
        Object.entries(hm).forEach(([key, value]) => {
          if (value[0].length === dateRange) {
            result.push({
              City: destination,
              "Check In Date": checkInDate.toISOString().split("T")[0],
              "Check Out Date": checkOutDate.toISOString().split("T")[0],
              Hotel: key,
              Price: value[1],
            });
          }
        });
    
        result.sort((a, b) => a.Price - b.Price);
        console.log("http code: (200) success")
        res.status(200).json(result);


    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
      res.status(500).json({ code: 500, error: "Error connecting to MongoDB" });

    }
});

// Function to validate ISO date format
function isValidISODate(dateStr) {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return isoDateRegex.test(dateStr);
}

// Handle 400 Bad Request errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      res.status(400).json({ error: "Bad Request" });
    } else {
      next(err);
    }
  });

app.use("/", router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

