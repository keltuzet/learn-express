import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import users from "./users";
import { User } from "./models";

const fs = require("fs");
const path = require("path");

dotenv.config();

const app: Express = express();
const port = 3000;
const urlencodedParser = express.urlencoded({ extended: false });
const jsonParser = express.json();

app.set("view engine", "hbs");

app.use((request, res, next) => {
  let now = new Date();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let data = `${hour}:${minutes}:${seconds} ${request.method} ${request.url} ${request.get("user-agent")}`;
  console.log(data);
  fs.appendFile("server.log", data + "\n", function () {});
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

/**
 * User request
 * Test: Send form data
 */
app.get("/request", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public", "request.html"));
});

app.post("/request", urlencodedParser, function (request, response) {
  if (!request.body) return response.sendStatus(400);
  console.log(request.body);
  response.send(`
    <b>${request.body.userFirstName} ${request.body.userLastName}</b><br/><br/>
    <i>${request.body.userAddress}</i><br/><br/>
    <u>${request.body.userMail}</u>
  `);
});

/**
 * About page
 * Test: Regular expresion for router path
 */
app.get("/about/[a-z0-9]+/", (req: Request, res: Response) => {
  const id = req.path.match(/(?<=about\/)([a-zA-Z])+/);
  if (id) {
    res.send({ id: id[0], name: "Tom" });
  } else {
    res.status(404).send(`${id} is not found!`);
  }
});

/**
 * Location Page
 * Test: Returning html string
 */
app.get("/Location", (req: Request, res: Response) => {
  res.send("<h1>Location</h1>");
});

/**
 * Unknown Page
 * Test: Send message with status
 */
app.use("/unknown", function (_, response) {
  response.status(404).send("The source was not found.");
});

/**
 * Ad Page
 * Test: Send status with default response
 */
app.use("/ad", function (_, response) {
  response.sendStatus(200);
});

/**
 * User Page
 * Test: Get and parse JSON
 */
const usersRouter = express.Router();
const usersRoutePath = "/users";
usersRouter.get("/", (req: Request, res: Response) => {
  const usersList = users.getUsers();
  res.status(200).send(`
    <h1>Users</h1>
    <table>
      <tr>
        <th>Name</th>
        <th>Age</th>
      </tr>
      ${
        usersList.length
          ? usersList
              .map(
                ({ firstName, lastName, age }) => `
                <tr>
                  <td>${firstName} ${lastName}</td>
                  <td>${age}</td>
                </tr>
              `
              )
              .join("")
          : ""
      }
    </table>

    <hr />
    <a href="/users/create">Add user</a>
  `);
});

usersRouter.get("/create", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public", "user-form.html"));
});

usersRouter.post("/create", jsonParser, function (request, response) {
  if (!request.body) return response.sendStatus(400);
  users.addUser(request.body);
  response.sendStatus(200);
});

usersRouter.get("/:id", (req: Request, res: Response) => {
  if (users.hasUser(req.params.id)) {
    res.sendStatus(404);
  } else {
    const user: User = users.getUser(req.params.id)!;
    res.status(200).send(`
      <p>First name: ${user.firstName}</p>
      <p>Last name: ${user.lastName}</p>
      ${user.middleName ? `<p>Middle name: ${user.middleName}</p>` : ""}
      <p>Age: ${user.age}</p>
    `);
  }
});

app.use(usersRoutePath, usersRouter);

app.use(express.static("public/static"));

app.use("/contact", function (_, response) {
  response.render("contact.hbs");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

/* app.get(/.*(\.)html$/, function (request, response) {
  response.send(request.url);
}); */

/* app.use("/index", function (_, response) {
  response.redirect("https://metanit.com");
}); */
