// create api endpoints using the express framework
import express from "express";
import { users } from "./db.js";
const app = express();

const PORT = 3000;

// first request : Get
app.get("/", (req, res) => {
  res.send({
    name: "Jean Wohking",
    age: "24",
    occupation: "Software Developer",
  });
});

// second endpoint
app.get("/users", (req, res) => {
  if (!users)
    return res
      .status(404)
      .json({ message: " no user found in the database", success: false });
  res.json(users);
});

// path parameters:gets a single user by id
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  console.log(`my id is ${id}`);
  console.log(typeof id);
  const user = users.find((u) => u.id === parseInt(id));
  if (!user)
    return res.status(404).json({ message: "user not found", success: false });
  res.json(user);
});

// post request : to create new data on the server
app.use(express.json());
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "no name or email", success: false });
  }
  const userData = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(userData);
  res.json(users);
});

// put request : to update existing data on the server
app.put("/users/:id", (req, res) => {
  const userIndex = users.findIndex((u) => u.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: "user not found", success: false });
  }
  const updatedUser = {
    id: parseInt(id),
    ...req.body,
  };

  users[userIndex] = updatedUser;
  res.json(updatedUser);
});

// delete request : to delete data from the server
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((u) => u.id === parseInt(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: "user not found", success: false });
  }

  const deletedUser = users.splice(userIndex, 1);
  res.json({
    message: "user deleted successfully",
    success: true,
    deletedUser,
  });
});
// PATCH request : to update partial data on the server
app.patch("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1)
    return res
      .status(404)
      .json({ message: "email patched successfully", success: false });
  const oldUser = users[userIndex];
  const newUser = req.body;
  const updatedUser = { ...oldUser, ...newUser };

  users[userIndex] = updatedUser;
  res.status(200).json(updatedUser);

  console.log(`my id is ${userId}`);
  console.log(`my index is ${userIndex}`);
});

// rest api(representative state transfer)
// it utilize the http protocol to communicate between client and server
// it has the following methods : get, post, put, delete, patch
// get : to retrieve data from the server
// post : to create new data on the server
// put : to update existing data on the server
// delete : to delete data from the server
// PATCH: updates but not all from server

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
