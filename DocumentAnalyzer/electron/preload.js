const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  auth: {
    login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser')
  },
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    create: (user) => ipcRenderer.invoke('users:create', user),
    update: (id, user) => ipcRenderer.invoke('users:update', id, user),
    delete: (id) => ipcRenderer.invoke('users:delete', id)
  },
  clients: {
    getAll: () => ipcRenderer.invoke('clients:getAll'),
    create: (client) => ipcRenderer.invoke('clients:create', client),
    update: (id, client) => ipcRenderer.invoke('clients:update', id, client),
    delete: (id) => ipcRenderer.invoke('clients:delete', id),
    import: (data) => ipcRenderer.invoke('clients:import', data)
  },
  employees: {
    getAll: () => ipcRenderer.invoke('employees:getAll'),
    create: (employee) => ipcRenderer.invoke('employees:create', employee),
    update: (id, employee) => ipcRenderer.invoke('employees:update', id, employee),
    delete: (id) => ipcRenderer.invoke('employees:delete', id),
    getRateHistory: (employeeId) => ipcRenderer.invoke('employees:getRateHistory', employeeId)
  },
  timesheets: {
    getAll: (options) => ipcRenderer.invoke('timesheets:getAll', options),
    create: (timesheet) => ipcRenderer.invoke('timesheets:create', timesheet),
    update: (id, timesheet) => ipcRenderer.invoke('timesheets:update', id, timesheet),
    delete: (id) => ipcRenderer.invoke('timesheets:delete', id),
    import: (data) => ipcRenderer.invoke('timesheets:import', data),
    getByClient: (clientId, startDate, endDate) => ipcRenderer.invoke('timesheets:getByClient', clientId, startDate, endDate),
    getBalance: (options) => ipcRenderer.invoke('timesheets:getBalance', options)
  },
  reports: {
    generateByClient: (clientId, startDate, endDate) => ipcRenderer.invoke('reports:generateByClient', clientId, startDate, endDate),
    generateAll: (startDate, endDate) => ipcRenderer.invoke('reports:generateAll', startDate, endDate),
    generateByEmployee: (employeeId, startDate, endDate) => ipcRenderer.invoke('reports:generateByEmployee', employeeId, startDate, endDate),
    generateAllEmployees: (startDate, endDate) => ipcRenderer.invoke('reports:generateAllEmployees', startDate, endDate),
    exportToExcel: (data, filename, reportMode) => ipcRenderer.invoke('reports:exportToExcel', data, filename, reportMode),
    exportToPDF: (data, filename, reportMode) => ipcRenderer.invoke('reports:exportToPDF', data, filename, reportMode)
  },
  audit: {
    getLogs: (filters) => ipcRenderer.invoke('audit:getLogs', filters)
  },
  sync: {
    selectFolder: () => ipcRenderer.invoke('sync:selectFolder'),
    selectFile: () => ipcRenderer.invoke('sync:selectFile'),
    getSyncPath: () => ipcRenderer.invoke('sync:getSyncPath'),
    getLastSync: () => ipcRenderer.invoke('sync:getLastSync'),
    syncNow: () => ipcRenderer.invoke('sync:syncNow')
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import')
  },
  onDatabaseUpdated: (callback) => {
    ipcRenderer.on('database-updated', callback);
  },
  removeDatabaseUpdatedListener: () => {
    ipcRenderer.removeAllListeners('database-updated');
  }
});
