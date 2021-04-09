const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const account = users.find( user => user.username === username)

  if(!account) {
    return response.status(404).send({ error: "User account dont exists!" })
  }

  request.account = account

  return next()
}

function checkUsernameAreAvaliable(request, response, next) {
    const { username } = request.body

    const accountExist = users.find( user => user.username === username)

    if(accountExist) {
      return response.status(400).send({ error: `User nickname ${username} aleardy exists!`})
    }

    next()
}

function checkTodoExists(request, response, next) {
  const { id } = request.params
  const { account } = request

  const todoList = account.todos.find( todo => {
    return todo.id === id
  })

  if(!todoList) {
    return response.status(404).send({ error: "Todo list not found!" })
  }

  request.todoList = todoList
  next()
}

app.post('/users',checkUsernameAreAvaliable, (request, response) => {
  const { name, username } = request.body
  
  const createdUser = {
    id: v4(), // precisa ser um uuid
    name, 
    username, 
    todos: []
  }
  users.push(createdUser)
  
  return response.status(201).json(createdUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { account } = request
  return response.status(201).send(account.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { account } = request

  const newTodo = { 
    id: v4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  account.todos.push(newTodo)

  return response.status(201).send(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todoList } = request
  const { title, deadline } = request.body

  todoList.title = title
  todoList.deadline = new Date(deadline)

  return response.status(201).send(todoList)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { todoList } = request

  todoList.done = true

  return response.status(201).send()
});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { account, todoList } = request
  account.todos.splice(todoList, 1)

  return response.status(204).json()
});

module.exports = app;