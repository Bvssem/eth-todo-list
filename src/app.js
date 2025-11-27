const App = {
  loading: false,
  contracts: {},
  web3Provider: null,
  account: '0x0',

  load: async () => {
    try {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    } catch (error) {
      console.error('Error loading app:', error)
    }
  },

  loadWeb3: async () => {
    if (window.ethereum) {
      App.web3Provider = window.ethereum
      window.web3 = new Web3(window.ethereum)
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
      } catch (error) {
        console.error('User denied account access')
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545')
      window.web3 = new Web3(App.web3Provider)
    }
  },

  loadAccount: async () => {
    const accounts = await window.web3.eth.getAccounts()
    App.account = accounts[0]
    console.log('Account:', App.account)
  },

  loadContract: async () => {
    try {
      const response = await fetch('/TodoList.json')
      const todoListAbi = await response.json()
      
      App.contracts.TodoList = TruffleContract(todoListAbi)
      App.contracts.TodoList.setProvider(App.web3Provider)

      App.todoList = await App.contracts.TodoList.deployed()
      console.log('Contract loaded:', App.todoList.address)
    } catch (error) {
      console.error('Error loading contract:', error)
      throw error
    }
  },

  render: async () => {
    if (App.loading) {
      return
    }

    App.setLoading(true)

    document.getElementById('account').innerText = App.account

    await App.renderTasks()

    App.setLoading(false)
  },

  renderTasks: async () => {
    try {
      const taskCount = await App.todoList.taskCount()
      const taskCountNum = parseInt(taskCount)

      const taskList = document.getElementById('taskList')
      const completedTaskList = document.getElementById('completedTaskList')
      
      taskList.innerHTML = ''
      completedTaskList.innerHTML = ''

      for (let i = 1; i <= taskCountNum; i++) {
        const task = await App.todoList.tasks(i)
        const taskId = parseInt(task.id)
        const taskContent = task.content
        const taskCompleted = task.completed

        const taskElement = document.createElement('li')
        taskElement.classList.add('list-group-item')

        const label = document.createElement('label')
        label.style.cursor = 'pointer'
        label.style.width = '100%'
        label.style.marginBottom = '0'

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = taskCompleted
        checkbox.name = taskId
        checkbox.style.marginRight = '10px'
        checkbox.addEventListener('click', App.toggleCompleted)

        const content = document.createElement('span')
        content.innerText = taskContent
        if (taskCompleted) {
          content.style.textDecoration = 'line-through'
        }

        label.appendChild(checkbox)
        label.appendChild(content)
        taskElement.appendChild(label)

        if (taskCompleted) {
          completedTaskList.appendChild(taskElement)
        } else {
          taskList.appendChild(taskElement)
        }
      }
    } catch (error) {
      console.error('Error rendering tasks:', error)
    }
  },

  createTask: async (e) => {
    e.preventDefault()
    App.setLoading(true)
    
    try {
      const content = document.getElementById('newTask').value
      if (!content.trim()) {
        alert('Please enter a task')
        App.setLoading(false)
        return
      }

      console.log('Creating task:', content)
      const tx = await App.todoList.createTask(content, { from: App.account })
      console.log('Transaction:', tx)
      
      document.getElementById('newTask').value = ''
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      await App.renderTasks()
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error: ' + error.message)
    }

    App.setLoading(false)
  },

  toggleCompleted: async (e) => {
    App.setLoading(true)
    
    try {
      const taskId = e.target.name
      console.log('Toggling task:', taskId)
      const tx = await App.todoList.toggleCompleted(taskId, { from: App.account })
      console.log('Transaction:', tx)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      await App.renderTasks()
    } catch (error) {
      console.error('Error toggling task:', error)
      alert('Error: ' + error.message)
    }

    App.setLoading(false)
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = document.getElementById('loader')
    const content = document.getElementById('content')
    
    if (boolean) {
      loader.style.display = 'block'
      content.style.display = 'none'
    } else {
      loader.style.display = 'none'
      content.style.display = 'block'
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  App.load()
})

// Hook create task button
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form')
  if (form) {
    form.addEventListener('submit', App.createTask)
  }
})
