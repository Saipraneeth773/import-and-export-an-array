const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "covid19India.db");
let db = null;

const initserver = async () => {
  try {
    db = await open({
      filename: "dbpath",
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

app.get("/states/", async (request, response) => {
  const result = `
    SELECT *
    FROM State`;
  const result1 = await db.all(result);
  response.send(result1);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateid } = request.params;
  const result = `
    SELECT *
    FROM State
    WHERE 
    state_id = ${stateid};`;
  const result1 = await db.get(result);
  response.send(result1);
});

app.post("/districts/", async (request, response) => {
  const { object } = request.body;
  const { stateId, cases, cured, active, deaths } = object;
  const result = `
    INSERT INTO District(state_id,cases,cured,active,deaths)
    VALUES (${stateId},${cases},${cured},${active},${deaths});`;
  await db.run(result);
  response.send("District successfully Added");
});

app.post("/districts/:districtId/", async (request, response) => {
  const { object } = request.params;
  const result = `
    SELECT *
    FROM District 
    WHERE 
    district_id = ${object};`;
  const result1 = await db.run(result);
  response.send(result1);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtid } = request.params;
  const result = `
    DELETE FROM District
    WHERE 
    district_id = ${districtid}`;
  await db.run(result);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { array } = request.body;
  const { districtid } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = array;
  const result = `
    UPDATE District
    SET 
    district_name = ${districtName},
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE 
    district_id = ${districtId}`;
  await db.run(result);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const result = `
   SELECT 
   COUNT(cases) as totalCases,
   COUNT(cured) as totalCured,
   COUNT(active) as totalActive,
   COUNT(deaths) as totalDeaths
   FROM State
   WHERE 
   state_id = ${stateId}
   ORDER BY 
   state_id;`;
  const result1 = await db.all(result);
  response.send(result1);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const result = `
    SELECT state_name
    FROM State INNER JOIN District on State.state_id = District.state_id
    WHERE 
    district_id = ${districtId}`;
  const result1 = db.get(result);
  response.send(result1);
});
